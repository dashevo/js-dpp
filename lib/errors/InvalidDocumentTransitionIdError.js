const ConsensusError = require('./ConsensusError');

class InvalidDocumentTransitionIdError extends ConsensusError {
  /**
   * @param {
   *   RawDocumentCreateTransition|RawDocumentReplaceTransition|RawDocumentDeleteTransition
   * } rawTransition
   */
  constructor(rawTransition) {
    super('Invalid document transition id');

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

module.exports = InvalidDocumentTransitionIdError;
