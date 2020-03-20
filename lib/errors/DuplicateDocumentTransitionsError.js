const ConsensusError = require('./ConsensusError');

class DuplicateDocumentTransitionsError extends ConsensusError {
  /**
   * @param {
   *   Array.<RawDocumentCreateTransition|RawDocumentReplaceTransition|RawDocumentDeleteTransition>
   * } rawTransitions
   */
  constructor(rawTransitions) {
    super('Duplicated document transitions found in state transition');

    this.rawTransitions = rawTransitions;
  }

  /**
   * Get duplicate raw transitions
   *
   * @return {
   *   Array.<RawDocumentCreateTransition|RawDocumentReplaceTransition|RawDocumentDeleteTransition>
   * }
   */
  getRawTransitions() {
    return this.rawTransitions;
  }
}

module.exports = DuplicateDocumentTransitionsError;
