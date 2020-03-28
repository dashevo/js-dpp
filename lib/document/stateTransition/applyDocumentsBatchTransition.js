const applyDocumentTransition = require('./documentTransition/applyDocumentTransition');

/**
 * Apply documents batch transition
 *
 * @param {DocumentsBatchTransition} stateTransition
 * @param { { id: string, document: Document|null }|{} } documents
 *
 * @returns { { id: string, document: Document|null }|{} }
 */
function applyDocumentsBatchTransition(stateTransition, documents) {
  return stateTransition.getTransitions().reduce((result, documentTransition) => {
    const documentId = documentTransition.getId();

    const document = documents[documentId];

    const resultDocument = applyDocumentTransition(
      stateTransition.getDataContractId(),
      stateTransition.getOwnerId(),
      documentTransition,
      document,
    );

    return {
      [documentId]: resultDocument,
      ...result,
    };
  }, {});
}

module.exports = applyDocumentsBatchTransition;
