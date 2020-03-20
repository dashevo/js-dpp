const ValidationResult = require('../../../../validation/ValidationResult');

const AbstractDocumentActionTransition = require('../../actionTransition/AbstractDocumentActionTransition');

const DataContractNotPresentError = require('../../../../errors/DataContractNotPresentError');
const InvalidDocumentTransitionIdError = require('../../../../errors/InvalidDocumentTransitionIdError');
const InvalidDocumentTransitionEntropyError = require('../../../../errors/InvalidDocumentTransitionEntropyError');
const DuplicateDocumentTransitionsError = require('../../../../errors/DuplicateDocumentTransitionsError');

const DocumentsStateTransition = require('../../DocumentsStateTransition');

const generateDocumentId = require('../../../generateDocumentId');
const entropy = require('../../../../util/entropy');


/**
 * @param {validateDocument} validateDocument
 * @param {findDuplicatesById} findDuplicatesById
 * @param {findDuplicatesByIndices} findDuplicatesByIndices
 * @param {fetchAndValidateDataContract} fetchAndValidateDataContract
 * @param {validateStateTransitionSignature} validateStateTransitionSignature
 * @param {validateIdentityExistence} validateIdentityExistence
 * @param {DataProvider} dataProvider
 *
 * @return {validateDocumentsSTStructure}
 */
function validateDocumentsSTStructureFactory(
  validateDocument,
  findDuplicatesById,
  findDuplicatesByIndices,
  fetchAndValidateDataContract,
  validateStateTransitionSignature,
  validateIdentityExistence,
  dataProvider,
) {
  /**
   * @typedef validateDocumentsSTStructure
   * @param {RawDocumentsStateTransition} rawStateTransition
   * @return {ValidationResult}
   */
  async function validateDocumentsSTStructure(rawStateTransition) {
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

    const createTransitions = rawStateTransition.transitions
      .filter(
        (t) => (t.$action === AbstractDocumentActionTransition.ACTIONS.CREATE),
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


    // Validate schema
    // TODO: validate sub-transition schema

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

    const stateTransition = new DocumentsStateTransition(rawStateTransition);

    // Verify ST signature
    stateTransition
      .setSignature(rawStateTransition.signature)
      .setSignaturePublicKeyId(rawStateTransition.signaturePublicKeyId);

    result.merge(
      await validateStateTransitionSignature(stateTransition, ownerId),
    );

    return result;
  }

  return validateDocumentsSTStructure;
}

module.exports = validateDocumentsSTStructureFactory;
