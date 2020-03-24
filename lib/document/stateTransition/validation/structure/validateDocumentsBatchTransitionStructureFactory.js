const ValidationResult = require('../../../../validation/ValidationResult');

const AbstractDocumentTransition = require('../../documentTransition/AbstractDocumentTransition');

const DataContractNotPresentError = require('../../../../errors/DataContractNotPresentError');
const InvalidDocumentTransitionIdError = require('../../../../errors/InvalidDocumentTransitionIdError');
const InvalidDocumentTransitionEntropyError = require('../../../../errors/InvalidDocumentTransitionEntropyError');
const DuplicateDocumentTransitionsError = require('../../../../errors/DuplicateDocumentTransitionsError');

const DocumentsBatchTransition = require('../../DocumentsBatchTransition');

const baseTransitionSchema = require('../../../../../schema/base/document-transition');
const createTransitionSchema = require('../../../../../schema/stateTransition/documentTransition/create');
const replaceTransitionSchema = require('../../../../../schema/stateTransition/documentTransition/replace');

const generateDocumentId = require('../../../generateDocumentId');
const entropy = require('../../../../util/entropy');

/**
 * @param {findDuplicatesById} findDuplicatesById
 * @param {findDuplicatesByIndices} findDuplicatesByIndices
 * @param {validateStateTransitionSignature} validateStateTransitionSignature
 * @param {validateIdentityExistence} validateIdentityExistence
 * @param {DataProvider} dataProvider
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
  dataProvider,
  validator,
  enrichDataContractWithBaseSchema,
) {
  /**
   * @typedef validateDocumentsBatchTransitionStructure
   * @param {RawDocumentsBatchTransition} rawStateTransition
   * @return {ValidationResult}
   */
  async function validateDocumentsBatchTransitionStructure(rawStateTransition) {
    const result = new ValidationResult();

    const {
      contractId: dataContractId,
      ownerId,
    } = rawStateTransition;

    // check data contract exists
    const dataContract = await dataProvider.fetchDataContract(dataContractId);

    if (!dataContract) {
      result.addError(
        new DataContractNotPresentError(dataContractId),
      );
    }

    if (!result.isValid()) {
      return result;
    }

    const createTransitions = rawStateTransition.transitions
      .filter(
        (t) => (t.$action === AbstractDocumentTransition.ACTIONS.CREATE),
      );

    const replaceTransitions = rawStateTransition.transitions
      .filter(
        (t) => (t.$action === AbstractDocumentTransition.ACTIONS.REPLACE),
      );

    const deleteTransitions = rawStateTransition.transitions
      .filter(
        (t) => (t.$action === AbstractDocumentTransition.ACTIONS.DELETE),
      );

    createTransitions
      .forEach((rawTransition) => {
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
      });

    const enrichedBaseDataContract = enrichDataContractWithBaseSchema(
      dataContract,
      baseTransitionSchema,
    );

    const enrichedDataContractsByActions = {
      [AbstractDocumentTransition.ACTIONS.CREATE]: enrichDataContractWithBaseSchema(
        enrichedBaseDataContract,
        createTransitionSchema,
      ),
      [AbstractDocumentTransition.ACTIONS.REPLACE]: enrichDataContractWithBaseSchema(
        enrichedBaseDataContract,
        replaceTransitionSchema,
      ),
    };

    // Validate schema of CREATE and REPLACE transitions
    createTransitions
      .concat(replaceTransitions)
      .forEach((rawTransition) => {
        // validate document schema
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
      });

    // validate DELETE transitions
    deleteTransitions
      .forEach((rawTransition) => {
        result.merge(
          validator.validate(
            baseTransitionSchema,
            rawTransition,
          ),
        );
      });

    // Find duplicate documents by type and ID
    const duplicateTransitions = findDuplicatesById(rawStateTransition.transitions);
    if (duplicateTransitions.length > 0) {
      result.addError(
        new DuplicateDocumentTransitionsError(duplicateTransitions),
      );
    }

    // Find duplicate transitions by unique indices
    const duplicateTransitionsByIndices = findDuplicatesByIndices(
      rawStateTransition.transitions,
      dataContract,
    );

    if (duplicateTransitionsByIndices.length > 0) {
      result.addError(
        new DuplicateDocumentTransitionsError(duplicateTransitionsByIndices),
      );
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
    stateTransition
      .setSignature(rawStateTransition.signature)
      .setSignaturePublicKeyId(rawStateTransition.signaturePublicKeyId);

    result.merge(
      await validateStateTransitionSignature(stateTransition, ownerId),
    );

    return result;
  }

  return validateDocumentsBatchTransitionStructure;
}

module.exports = validateDocumentsBatchTransitionStructureFactory;
