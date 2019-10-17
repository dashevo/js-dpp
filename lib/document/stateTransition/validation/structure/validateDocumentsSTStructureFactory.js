const ValidationResult = require('../../../../validation/ValidationResult');

const Document = require('../../../Document');

const MismatchSTDocumentsAndActionsError = require('../../../../errors/MismatchSTDocumentsAndActionsError');

const STDuplicateDocumentsError = require('../../../../errors/STDuplicateDocumentsError');
const STContainsDocumentsFromDifferentUsersError = require('../../../../errors/STContainsDocumentsFromDifferentUsersError');

/**
 * @param {validateDocument} validateDocument
 * @param {findDuplicateDocumentsById} findDuplicateDocumentsById
 * @param {findDuplicateDocumentsByIndices} findDuplicateDocumentsByIndices
 * @return {validateDocumentsSTStructure}
 */
function validateDocumentsSTStructureFactory(
  validateDocument,
  findDuplicateDocumentsById,
  findDuplicateDocumentsByIndices,
) {
  /**
   * @typedef validateDocumentsSTStructure
   * @param {RawDocumentsStateTransition} rawStateTransition
   * @param {DataContract} dataContract
   * @return {ValidationResult}
   */
  function validateDocumentsSTStructure(rawStateTransition, dataContract) {
    const result = new ValidationResult();

    if (rawStateTransition.documents.length !== rawStateTransition.actions.length) {
      result.addError(
        new MismatchSTDocumentsAndActionsError(rawStateTransition),
      );

      return result;
    }

    rawStateTransition.documents.forEach((document, index) => {
      const action = rawStateTransition.actions[index];

      result.merge(
        validateDocument(document, dataContract, { action }),
      );
    });

    if (!result.isValid()) {
      return result;
    }

    // Convert raw documents to Document instances
    const documents = rawStateTransition.documents.map((rawDocument, index) => {
      const document = new Document(rawDocument);

      document.setAction(rawStateTransition.actions[index]);

      return document;
    });

    // Find duplicate documents by type and ID
    const duplicateDocuments = findDuplicateDocumentsById(documents);
    if (duplicateDocuments.length) {
      result.addError(
        new STDuplicateDocumentsError(duplicateDocuments),
      );
    }

    // Find duplicate documents by unique indices
    const duplicateDocumentsByIndices = findDuplicateDocumentsByIndices(
      documents,
      dataContract,
    );
    if (duplicateDocumentsByIndices.length > 0) {
      result.addError(
        new STDuplicateDocumentsError(duplicateDocumentsByIndices),
      );
    }

    // Make sure that there are no documents from different users
    const documentsFromDifferentUsers = Object.values(
      documents.reduce((docs, document) => {
        if (!docs[document.getUserId()]) {
          // eslint-disable-next-line no-param-reassign
          docs[document.getUserId()] = document.toJSON();
        }

        return docs;
      }, {}),
    );

    if (documentsFromDifferentUsers.length > 1) {
      result.addError(
        new STContainsDocumentsFromDifferentUsersError(
          documentsFromDifferentUsers,
        ),
      );
    }

    return result;
  }

  return validateDocumentsSTStructure;
}

module.exports = validateDocumentsSTStructureFactory;
