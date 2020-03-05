const ConsensusError = require('./ConsensusError');

class DocumentIdComponentsMismatchError extends ConsensusError {
  /**
   * @param {Document} document
   * @param {Document} fetchedDocument
   */
  constructor(document, fetchedDocument) {
    super('Document id components mismatch with previous versions');

    this.document = document;
    this.fetchedDocument = fetchedDocument;
  }

  /**
   * Get Document
   *
   * @return {Document}
   */
  getDocument() {
    return this.document;
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

module.exports = DocumentIdComponentsMismatchError;
