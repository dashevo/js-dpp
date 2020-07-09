const ConsensusError = require('./ConsensusError');

class DocumentTimestampWasAlteredError extends ConsensusError {
  /**
   * @param {DocumentReplaceTransition} documentTransition
   * @param {Document} fetchedDocument
   */
  constructor(documentTransition, fetchedDocument) {
    super('Document timestamp was altered during update');

    this.documentTransition = documentTransition;
    this.fetchedDocument = fetchedDocument;
  }

  /**
   * Get Document Action Transition
   *
   * @return {DocumentReplaceTransition|DocumentDeleteTransition}
   */
  getDocumentTransition() {
    return this.documentTransition;
  }

  /**
   * Get fetched Document
   *
   * @return {Document}
   */
  getFetchedDocument() {
    return this.fetchedDocument;
  }
}

module.exports = DocumentTimestampWasAlteredError;
