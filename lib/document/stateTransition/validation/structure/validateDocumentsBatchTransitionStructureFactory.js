const bs58 = require('bs58');
const ValidationResult = require('../../../../validation/ValidationResult');

const AbstractDocumentTransition = require('../../documentTransition/AbstractDocumentTransition');

const DataContractNotPresentError = require('../../../../errors/DataContractNotPresentError');
const InvalidDocumentTransitionIdError = require('../../../../errors/InvalidDocumentTransitionIdError');
const InvalidDocumentTransitionEntropyError = require('../../../../errors/InvalidDocumentTransitionEntropyError');
const DuplicateDocumentTransitionsError = require('../../../../errors/DuplicateDocumentTransitionsError');
const MissingDocumentTypeError = require('../../../../errors/MissingDocumentTypeError');
const InvalidDocumentTypeError = require('../../../../errors/InvalidDocumentTypeError');
const InvalidDocumentTransitionActionError = require('../../../../errors/InvalidDocumentTransitionActionError');
const MissingDocumentTransitionActionError = require('../../../../errors/MissingDocumentTransitionActionError');
const MissingDataContractIdError = require('../../../../errors/MissingDataContractIdError');
const InvalidDataContractIdError = require('../../../../errors/InvalidDataContractIdError');

const DocumentsBatchTransition = require('../../DocumentsBatchTransition');

const baseTransitionSchema = require('../../../../../schema/document/stateTransition/documentTransition/base');
const createTransitionSchema = require('../../../../../schema/document/stateTransition/documentTransition/create');
const replaceTransitionSchema = require('../../../../../schema/document/stateTransition/documentTransition/replace');

const generateDocumentId = require('../../../generateDocumentId');
const entropy = require('../../../../util/entropy');
const EncodedBuffer = require('../../../../util/encoding/EncodedBuffer');

/**
 * @param {findDuplicatesById} findDuplicatesById
 * @param {findDuplicatesByIndices} findDuplicatesByIndices
 * @param {validateStateTransitionSignature} validateStateTransitionSignature
 * @param {validateIdentityExistence} validateIdentityExistence
 * @param {StateRepository} stateRepository
 * @param {JsonSchemaValidator} validator
 * @param {enrichDataContractWithBaseSchema} enrichDataContractWithBaseSchema
 *
 * @return {validateDocumentsBatchTransitionStructure}
 */
function validateDocumentsBatchTransitionStructureFactory(
  findDuplicatesById,
  findDuplicatesByIndices,
  validateStateTransitionSignature,
  validateIdentityExistence,
  stateRepository,
  validator,
  enrichDataContractWithBaseSchema,
) {
  const { ACTIONS } = AbstractDocumentTransition;

  /**
   *
   * @param dataContract
   * @param {Buffer} ownerId
   * @param documentTransitions
   * @return {Promise<ValidationResult>}
   */
  async function validateDocumentTransitions(dataContract, ownerId, documentTransitions) {
    const result = new ValidationResult();

    if (!result.isValid()) {
      return result;
    }

    const enrichedBaseDataContract = enrichDataContractWithBaseSchema(
      dataContract,
      baseTransitionSchema,
    );

    const enrichedDataContractsByActions = {
      [ACTIONS.CREATE]: enrichDataContractWithBaseSchema(
        enrichedBaseDataContract,
        createTransitionSchema,
        'documentCreateTransition',
      ),
      [ACTIONS.REPLACE]: enrichDataContractWithBaseSchema(
        enrichedBaseDataContract,
        replaceTransitionSchema,
        'documentRepTransition',
        ['$createdAt'],
      ),
    };

    documentTransitions.forEach((rawDocumentTransition) => {
      // Validate $type
      if (!Object.prototype.hasOwnProperty.call(rawDocumentTransition, '$type')) {
        result.addError(
          new MissingDocumentTypeError(rawDocumentTransition),
        );

        return;
      }

      if (!dataContract.isDocumentDefined(rawDocumentTransition.$type)) {
        result.addError(
          new InvalidDocumentTypeError(rawDocumentTransition.$type, dataContract),
        );

        return;
      }

      // Validate $action
      if (!Object.prototype.hasOwnProperty.call(rawDocumentTransition, '$action')) {
        result.addError(
          new MissingDocumentTransitionActionError(rawDocumentTransition),
        );

        return;
      }

      // Validate document schema
      switch (rawDocumentTransition.$action) {
        case ACTIONS.CREATE:
        case ACTIONS.REPLACE: {
          // eslint-disable-next-line max-len
          const enrichedDataContract = enrichedDataContractsByActions[rawDocumentTransition.$action];

          const documentSchemaRef = enrichedDataContract.getDocumentSchemaRef(
            rawDocumentTransition.$type,
          );

          const additionalSchemas = {
            [enrichedDataContract.getJsonSchemaId()]:
            enrichedDataContract.toJSON(),
          };

          const schemaResult = validator.validate(
            documentSchemaRef,
            rawDocumentTransition,
            additionalSchemas,
          );

          if (!schemaResult.isValid()) {
            result.merge(schemaResult);

            break;
          }

          // Additional checks for CREATE transitions
          if (ACTIONS.CREATE === rawDocumentTransition.$action) {
            // validate id generation
            const documentId = generateDocumentId(
              dataContract.getId(),
              ownerId,
              rawDocumentTransition.$type,
              bs58.decode(rawDocumentTransition.$entropy),
            );

            const idBuffer = EncodedBuffer.from(
              rawDocumentTransition.$id,
              EncodedBuffer.ENCODING.BASE58,
            );

            if (Buffer.compare(idBuffer, documentId) !== 0) {
              result.addError(
                new InvalidDocumentTransitionIdError(rawDocumentTransition),
              );
            }

            // validate entropy
            if (!entropy.validate(bs58.decode(rawDocumentTransition.$entropy))) {
              result.addError(
                new InvalidDocumentTransitionEntropyError(rawDocumentTransition),
              );
            }
          }

          break;
        }
        case ACTIONS.DELETE:
          result.merge(
            validator.validate(
              baseTransitionSchema,
              rawDocumentTransition,
            ),
          );

          break;
        default:
          result.addError(
            new InvalidDocumentTransitionActionError(
              rawDocumentTransition.$action,
              rawDocumentTransition,
            ),
          );
      }
    });

    if (!result.isValid()) {
      return result;
    }

    // Find duplicate documents by type and ID
    const duplicateTransitions = findDuplicatesById(documentTransitions);
    if (duplicateTransitions.length > 0) {
      result.addError(
        new DuplicateDocumentTransitionsError(duplicateTransitions),
      );
    }

    // Find duplicate transitions by unique indices
    const duplicateTransitionsByIndices = findDuplicatesByIndices(
      documentTransitions,
      dataContract,
    );

    if (duplicateTransitionsByIndices.length > 0) {
      result.addError(
        new DuplicateDocumentTransitionsError(duplicateTransitionsByIndices),
      );
    }

    return result;
  }

  /**
   * @typedef validateDocumentsBatchTransitionStructure
   * @param {RawDocumentsBatchTransition} stateTransitionJson
   * @return {ValidationResult}
   */
  async function validateDocumentsBatchTransitionStructure(stateTransitionJson) {
    const result = new ValidationResult();

    const ownerIdBuffer = EncodedBuffer.from(
      stateTransitionJson.ownerId,
      EncodedBuffer.ENCODING.BASE58,
    ).toBuffer();
    // Group document transitions by data contracts
    const documentTransitionsByContracts = stateTransitionJson.transitions
      .reduce((obj, rawDocumentTransition) => {
        if (!Object.prototype.hasOwnProperty.call(rawDocumentTransition, '$dataContractId')) {
          result.addError(
            new MissingDataContractIdError(rawDocumentTransition),
          );

          return obj;
        }

        if (typeof rawDocumentTransition.$dataContractId !== 'string') {
          result.addError(
            new InvalidDataContractIdError(rawDocumentTransition.$dataContractId),
          );

          return obj;
        }

        const dataContractId = EncodedBuffer.from(
          rawDocumentTransition.$dataContractId,
          EncodedBuffer.ENCODING.BASE58,
        ).toString();

        if (!obj[dataContractId]) {
          // eslint-disable-next-line no-param-reassign
          obj[dataContractId] = [];
        }

        obj[dataContractId].push(rawDocumentTransition);

        return obj;
      }, {});

    const dataContracts = [];

    const documentTransitionResultsPromises = Object.entries(documentTransitionsByContracts)
      .map(async ([dataContractId, documentTransitions]) => {
        const perDocumentResult = new ValidationResult();

        const dataContractIdBuffer = EncodedBuffer.from(
          dataContractId,
          EncodedBuffer.ENCODING.BASE58,
        ).toBuffer();

        const dataContract = await stateRepository.fetchDataContract(dataContractIdBuffer);

        if (!dataContract) {
          perDocumentResult.addError(
            new DataContractNotPresentError(dataContractIdBuffer),
          );
        }

        if (!perDocumentResult.isValid()) {
          return perDocumentResult;
        }

        dataContracts.push(dataContract);

        perDocumentResult.merge(
          await validateDocumentTransitions(
            dataContract,
            ownerIdBuffer,
            documentTransitions,
          ),
        );

        return perDocumentResult;
      });

    const documentTransitionResults = await Promise.all(documentTransitionResultsPromises);
    documentTransitionResults.forEach(result.merge.bind(result));

    if (!result.isValid()) {
      return result;
    }

    const stateTransition = DocumentsBatchTransition.fromJSON(stateTransitionJson, dataContracts);

    // User must exist and confirmed
    result.merge(
      await validateIdentityExistence(
        stateTransition.getOwnerId(),
      ),
    );

    if (!result.isValid()) {
      return result;
    }

    // Verify ST signature
    result.merge(
      await validateStateTransitionSignature(stateTransition, ownerIdBuffer),
    );

    return result;
  }

  return validateDocumentsBatchTransitionStructure;
}

module.exports = validateDocumentsBatchTransitionStructureFactory;
