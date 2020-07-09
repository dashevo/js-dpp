const ConsensusError = require('./ConsensusError');

class DocumentTimestampsMismatchError extends ConsensusError {
  /**
   * @param {DocumentCreateTransition} documentTransition
   */
  constructor(documentTransition) {
    super('Document create at and update at timestamps are not equal');

    this.documentTransition = documentTransition;
  }

  /**
   * Get document create transition
   *
   * @return {DocumentCreateTransition}
   */
  getDocumentTransition() {
    return this.documentTransition;
  }
}

module.exports = DocumentTimestampsMismatchError;
