const AbstractDocumentTransition = require('./AbstractDocumentTransition');

const InvalidDocumentActionError = require('../../errors/InvalidDocumentActionError');
const DocumentAlreadyExistsError = require('../../errors/DocumentAlreadyExistsError');
const DocumentNotProvidedError = require('../../errors/DocumentNotProvidedError');

const Document = require('../../Document');

/**
 * Apply document transition to a document
 *
 * @param {string} dataContractId
 * @param {string} ownerId
 * @param {
 *   DocumentCreateTransition|DocumentReplaceTransition|DocumentDeleteTransition
 * } documentTransition
 * @param {Document} document
 *
 * @returns {Document|null}
 */
function applyDocumentTransition(dataContractId, ownerId, documentTransition, document) {
  switch (documentTransition.getAction()) {
    case AbstractDocumentTransition.ACTIONS.CREATE: {
      if (document) {
        throw new DocumentAlreadyExistsError(documentTransition);
      }

      const newDocument = new Document({
        $id: documentTransition.getId(),
        $type: documentTransition.getType(),
        $contractId: dataContractId,
        $ownerId: ownerId,
        ...documentTransition.getData(),
      });

      newDocument.setEntropy(documentTransition.getEntropy());

      return newDocument;
    }
    case AbstractDocumentTransition.ACTIONS.REPLACE: {
      if (!document) {
        throw new DocumentNotProvidedError(documentTransition);
      }

      return new Document({
        $id: document.getId(),
        $type: document.getType(),
        $contractId: dataContractId,
        $ownerId: ownerId,
        $rev: documentTransition.getRevision(),
        ...documentTransition.getData(),
      });
    }
    case AbstractDocumentTransition.ACTIONS.DELETE: {
      if (!document) {
        throw new DocumentNotProvidedError(documentTransition);
      }

      return null;
    }
    default:
      throw new InvalidDocumentActionError(documentTransition);
  }
}

module.exports = applyDocumentTransition;
