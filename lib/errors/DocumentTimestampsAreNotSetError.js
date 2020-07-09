const ConsensusError = require('./ConsensusError');

class DocumentTimestampsAreNotSetError extends ConsensusError {
  /**
   * @param {
   *   DocumentCreateTransition|DocumentReplaceTransition
   * } documentTransition
   */
  constructor(documentTransition) {
    super('Document timestamps are not set');

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

module.exports = DocumentTimestampsAreNotSetError;
