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

const DocumentsBatchTransition = require('../../DocumentsBatchTransition');

const baseTransitionSchema = require('../../../../../schema/document/stateTransition/documentTransition/base');
const createTransitionSchema = require('../../../../../schema/document/stateTransition/documentTransition/create');
const replaceTransitionSchema = require('../../../../../schema/document/stateTransition/documentTransition/replace');

const generateDocumentId = require('../../../generateDocumentId');
const entropy = require('../../../../util/entropy');

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

  async function validateDocumentTransitions(dataContractId, ownerId, documentTransitions) {
    const result = new ValidationResult();

    const dataContract = await stateRepository.fetchDataContract(dataContractId);

    if (!dataContract) {
      result.addError(
        new DataContractNotPresentError(dataContractId),
      );
    }

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
      ),
      [ACTIONS.REPLACE]: enrichDataContractWithBaseSchema(
        enrichedBaseDataContract,
        replaceTransitionSchema,
      ),
    };

    documentTransitions.forEach((rawTransition) => {
      // Validate $type
      if (!Object.prototype.hasOwnProperty.call(rawTransition, '$type')) {
        result.addError(
          new MissingDocumentTypeError(rawTransition),
        );

        return;
      }

      if (!dataContract.isDocumentDefined(rawTransition.$type)) {
        result.addError(
          new InvalidDocumentTypeError(rawTransition.$type, dataContract),
        );

        return;
      }

      // Validate $action
      if (!Object.prototype.hasOwnProperty.call(rawTransition, '$action')) {
        result.addError(
          new MissingDocumentTransitionActionError(rawTransition),
        );

        return;
      }

      // Validate document schema
      switch (rawTransition.$action) {
        case ACTIONS.CREATE:
        case ACTIONS.REPLACE: {
          const documentSchemaRef = dataContract.getDocumentSchemaRef(rawTransition.$type);

          const additionalSchemas = {
            [dataContract.getJsonSchemaId()]: enrichedDataContractsByActions[rawTransition.$action],
          };

          result.merge(
            validator.validate(
              documentSchemaRef,
              rawTransition,
              additionalSchemas,
            ),
          );

          // Additional checks for CREATE transitions
          if (ACTIONS.CREATE === rawTransition.$action) {
            // validate id generation
            const documentId = generateDocumentId(
              dataContractId,
              ownerId,
              rawTransition.$type,
              rawTransition.$entropy,
            );

            if (rawTransition.$id !== documentId) {
              result.addError(
                new InvalidDocumentTransitionIdError(rawTransition),
              );
            }

            // validate entropy
            if (!entropy.validate(rawTransition.$entropy)) {
              result.addError(
                new InvalidDocumentTransitionEntropyError(rawTransition),
              );
            }
          }

          break;
        }
        case ACTIONS.DELETE:
          result.merge(
            validator.validate(
              baseTransitionSchema,
              rawTransition,
            ),
          );

          break;
        default:
          result.addError(
            new InvalidDocumentTransitionActionError(rawTransition.$action, rawTransition),
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
   * @param {RawDocumentsBatchTransition} rawStateTransition
   * @return {ValidationResult}
   */
  async function validateDocumentsBatchTransitionStructure(rawStateTransition) {
    const result = new ValidationResult();

    const { ownerId } = rawStateTransition;

    // Group document transitions by data contracts
    const documentTransitionsByContracts = rawStateTransition.transitions
      .reduce((obj, rawDocumentTransition) => {
        if (!Object.prototype.hasOwnProperty.call(rawDocumentTransition, '$dataContractId')) {
          result.addError(
            new MissingDataContractIdError(rawDocumentTransition),
          );

          return obj;
        }

        if (obj[rawDocumentTransition.$dataContractId] === undefined) {
          // eslint-disable-next-line no-param-reassign
          obj[rawDocumentTransition.$dataContractId] = [];
        }

        obj[rawDocumentTransition.$dataContractId].push(rawDocumentTransition);

        return obj;
      }, {});

    const validationResultPromises = Object.entries(documentTransitionsByContracts)
      .map(([dataContractId, documentTransitions]) => (
        validateDocumentTransitions(dataContractId, ownerId, documentTransitions)
      ));

    const validationResults = await Promise.all(validationResultPromises);
    validationResults.forEach(result.merge.bind(result));

    if (!result.isValid()) {
      return result;
    }

    // User must exist and confirmed
    result.merge(
      await validateIdentityExistence(
        ownerId,
      ),
    );

    if (!result.isValid()) {
      return result;
    }

    const stateTransition = new DocumentsBatchTransition(rawStateTransition);

    // Verify ST signature
    result.merge(
      await validateStateTransitionSignature(stateTransition, ownerId),
    );

    return result;
  }

  return validateDocumentsBatchTransitionStructure;
}

module.exports = validateDocumentsBatchTransitionStructureFactory;
