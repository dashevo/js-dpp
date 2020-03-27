const applyDocumentTransition = require('./documentTransition/applyDocumentTransition');

/**
 * Select document by id among documents array
 *
 * @param {string} id
 * @param {Document[]} documents
 *
 * @return {Document|null}
 */
function findDocumentById(id, documents) {
  const [foundDocument] = documents
    .filter((document) => document.getId() === id);

  return foundDocument;
}

/**
 * Apply documents batch transition
 *
 * @param {DocumentsBatchTransition} stateTransition
 * @param {Document[]} documents
 *
 * @returns { { id: string, document: Document|null }|{} }
 */
function applyDocumentsBatchTransition(stateTransition, documents) {
  return stateTransition.getTransitions().reduce((result, documentTransition) => {
    const document = findDocumentById(documentTransition.getId(), documents);

    const resultDocument = applyDocumentTransition(
      stateTransition.getDataContractId(),
      stateTransition.getOwnerId(),
      documentTransition,
      document,
    );

    return {
      [documentTransition.getId()]: resultDocument,
      ...result,
    };
  }, {});
}

module.exports = applyDocumentsBatchTransition;
