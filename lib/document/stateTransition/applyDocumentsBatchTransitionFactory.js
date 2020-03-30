const AbstractDocumentTransition = require(
  './documentTransition/AbstractDocumentTransition',
);

/**
 * @param {StateRepository} stateRepository
 * @param {applyDocumentsBatchTransitionToModels} applyDocumentsBatchTransitionToModels
 *
 * @returns {applyDocumentsBatchTransition}
 */
function applyDocumentsBatchTransitionFactory(
  stateRepository,
  applyDocumentsBatchTransitionToModels,
) {
  /**
   * Apply documents batch state transition
   *
   * @typedef applyDocumentsBatchTransition
   *
   * @param {DocumentsBatchTransition} stateTransition
   *
   * @return {Promise<void>}
   */
  async function applyDocumentsBatchTransition(stateTransition) {
    const existingDocuments = stateTransition.getTransitions()
      .reduce(async (result, documentTransition) => {
        const documentId = documentTransition.getId();

        const [existingDocument] = await stateRepository.fetchDocuments(
          stateTransition.getDataContractId(),
          documentTransition.getType(),
          { where: [['$id', '==', documentId]] },
        );

        return {
          ...result,
          [documentId]: existingDocument,
        };
      }, {});

    const documents = await applyDocumentsBatchTransitionToModels(
      stateTransition, existingDocuments,
    );

    const documentsToStore = stateTransition.getTransitions()
      .filter((documentTransition) => (
        documentTransition.getAction() === AbstractDocumentTransition.ACTIONS.CREATE
          || documentTransition.getAction() === AbstractDocumentTransition.ACTIONS.REPLACE
      ))
      .map((documentTransition) => documents[documentTransition.getId()]);

    const documentsToRemove = stateTransition.getTransitions()
      .filter((documentTransition) => (
        documentTransition.getAction() === AbstractDocumentTransition.ACTIONS.DELETE
      ))
      .map((documentTransition) => documents[documentTransition.getId()]);

    await stateRepository.storeDocuments(documentsToStore);
    await stateRepository.removeDocuments(documentsToRemove);
  }

  return applyDocumentsBatchTransition;
}

module.exports = applyDocumentsBatchTransitionFactory;
