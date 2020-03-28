const AbstractDocumentTransition = require('./AbstractDocumentTransition');
const DocumentCreateTransition = require('./DocumentCreateTransition');

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
      newDocument.setRevision(DocumentCreateTransition.INITIAL_REVISION);

      return newDocument;
    }
    case AbstractDocumentTransition.ACTIONS.REPLACE: {
      if (!document) {
        throw new DocumentNotProvidedError(documentTransition);
      }

      document.setRevision(documentTransition.getRevision());
      document.setData(documentTransition.getData());

      return document;
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
