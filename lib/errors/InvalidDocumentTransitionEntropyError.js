const ConsensusError = require('./ConsensusError');

class InvalidDocumentTransitionEntropyError extends ConsensusError {
  /**
   * @param {
   *   RawDocumentCreateTransition|RawDocumentReplaceTransition|RawDocumentDeleteTransition
   * } rawTransition
   */
  constructor(rawTransition) {
    super('Invalid document transition entropy');

    this.rawTransition = rawTransition;
  }

  /**
   * Get raw document transition
   *
   * @return {
   *   RawDocumentCreateTransition|RawDocumentReplaceTransition|RawDocumentDeleteTransition
   * }
   */
  getRawTransition() {
    return this.rawTransition;
  }
}

module.exports = InvalidDocumentTransitionEntropyError;
