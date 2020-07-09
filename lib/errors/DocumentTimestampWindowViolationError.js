const ConsensusError = require('./ConsensusError');

class DocumentTimestampWindowViolationError extends ConsensusError {
  /**
   * @param {DocumentCreateTransition
   *        |DocumentReplaceTransition} documentTransition
   * @param {Document} fetchedDocument
   */
  constructor(documentTransition, fetchedDocument) {
    super('Document timestamp are out of block time window');

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

module.exports = DocumentTimestampWindowViolationError;
