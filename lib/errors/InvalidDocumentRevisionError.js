const ConsensusError = require('./ConsensusError');

class InvalidDocumentRevisionError extends ConsensusError {
  /**
   * @param {DocumentReplaceTransition} documentTransition
   * @param {Document} fetchedDocument
   */
  constructor(documentTransition, fetchedDocument) {
    super('Invalid Document revision');

    this.documentTransition = documentTransition;
    this.fetchedDocument = fetchedDocument;
  }

  /**
   * Get Document replace transition
   *
   * @return {DocumentReplaceTransition}
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

module.exports = InvalidDocumentRevisionError;
