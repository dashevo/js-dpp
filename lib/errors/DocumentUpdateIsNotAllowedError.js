const ConsensusError = require('./ConsensusError');

class DocumentUpdateIsNotAllowedError extends ConsensusError {
  /**
   * @param {Document} document
   */
  constructor(document) {
    super('Document belongs to another user');

    this.document = document;
  }

  /**
   * Get Document
   *
   * @return {Document}
   */
  getDocument() {
    return this.document;
  }
}

module.exports = DocumentUpdateIsNotAllowedError;
