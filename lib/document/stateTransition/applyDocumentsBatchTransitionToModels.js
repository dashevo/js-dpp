const AbstractDocumentTransition = require('./documentTransition/AbstractDocumentTransition');
const DocumentCreateTransition = require('./documentTransition/DocumentCreateTransition');

const InvalidDocumentActionError = require('../errors/InvalidDocumentActionError');
const DocumentAlreadyExistsError = require('../errors/DocumentAlreadyExistsError');
const DocumentNotProvidedError = require('../errors/DocumentNotProvidedError');

const Document = require('../Document');

/**
 * Apply documents batch transition
 *
 * @typedef applyDocumentsBatchTransitionToModels
 *
 * @param {DocumentsBatchTransition} stateTransition
 * @param { { id: string, document: Document|null }|{} } documents
 *
 * @returns { { id: string, document: Document|null }|{} }
 */
function applyDocumentsBatchTransitionToModels(stateTransition, documents) {
  return stateTransition.getTransitions().reduce((result, documentTransition) => {
    const documentId = documentTransition.getId();

    const document = documents[documentId];

    let resultDocument = null;
    switch (documentTransition.getAction()) {
      case AbstractDocumentTransition.ACTIONS.CREATE: {
        if (document) {
          throw new DocumentAlreadyExistsError(documentTransition);
        }

        const newDocument = new Document({
          $id: documentTransition.getId(),
          $type: documentTransition.getType(),
          $contractId: stateTransition.getDataContractId(),
          $ownerId: stateTransition.getOwnerId(),
          ...documentTransition.getData(),
        });

        newDocument.setEntropy(documentTransition.getEntropy());
        newDocument.setRevision(DocumentCreateTransition.INITIAL_REVISION);

        resultDocument = newDocument;
        break;
      }
      case AbstractDocumentTransition.ACTIONS.REPLACE: {
        if (!document) {
          throw new DocumentNotProvidedError(documentTransition);
        }

        document.setRevision(documentTransition.getRevision());
        document.setData(documentTransition.getData());

        resultDocument = document;
        break;
      }
      case AbstractDocumentTransition.ACTIONS.DELETE: {
        if (!document) {
          throw new DocumentNotProvidedError(documentTransition);
        }

        break;
      }
      default:
        throw new InvalidDocumentActionError(documentTransition);
    }

    return {
      [documentId]: resultDocument,
      ...result,
    };
  }, {});
}

module.exports = applyDocumentsBatchTransitionToModels;
