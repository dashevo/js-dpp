const AbstractDocumentTransition = require(
  './documentTransition/AbstractDocumentTransition',
);
const DocumentCreateTransition = require('./documentTransition/DocumentCreateTransition');

const InvalidDocumentActionError = require('../errors/InvalidDocumentActionError');
const DocumentNotProvidedError = require('../errors/DocumentNotProvidedError');

const Document = require('../Document');

/**
 * @param {StateRepository} stateRepository
 * @param {fetchDocuments} fetchDocuments
 *
 * @returns {applyDocumentsBatchTransition}
 */
function applyDocumentsBatchTransitionFactory(
  stateRepository,
  fetchDocuments,
) {
  /**
   * Apply documents batch state transition
   *
   * @typedef applyDocumentsBatchTransition
   *
   * @param {DocumentsBatchTransition} stateTransition
   *
   * @return {Promise<*>}
   */
  async function applyDocumentsBatchTransition(stateTransition) {
    const replaceTransitions = stateTransition.getTransitions()
      .filter((dt) => dt.getAction() === AbstractDocumentTransition.ACTIONS.REPLACE);

    const existingDocuments = await fetchDocuments(
      stateTransition.getDataContractId(), replaceTransitions,
    ).reduce((result, document) => (
      {
        ...result,
        [document.getId()]: document,
      }
    ), {});

    return Promise.all(stateTransition.getTransitions().map(async (documentTransition) => {
      const documentId = documentTransition.getId();

      switch (documentTransition.getAction()) {
        case AbstractDocumentTransition.ACTIONS.CREATE: {
          const newDocument = new Document({
            $id: documentTransition.getId(),
            $type: documentTransition.getType(),
            $contractId: stateTransition.getDataContractId(),
            $ownerId: stateTransition.getOwnerId(),
            ...documentTransition.getData(),
          });

          newDocument.setEntropy(documentTransition.getEntropy());
          newDocument.setRevision(DocumentCreateTransition.INITIAL_REVISION);

          await stateRepository.storeDocument(newDocument);
          break;
        }
        case AbstractDocumentTransition.ACTIONS.REPLACE: {
          const document = existingDocuments[documentId];

          if (!document) {
            throw new DocumentNotProvidedError(documentTransition);
          }

          document.setRevision(documentTransition.getRevision());
          document.setData(documentTransition.getData());

          await stateRepository.storeDocument(document);
          break;
        }
        case AbstractDocumentTransition.ACTIONS.DELETE: {
          await stateRepository.removeDocument(documentId);
          break;
        }
        default:
          throw new InvalidDocumentActionError(documentTransition);
      }
    }));
  }

  return applyDocumentsBatchTransition;
}

module.exports = applyDocumentsBatchTransitionFactory;
