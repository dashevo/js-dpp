const ConsensusError = require('./ConsensusError');

class InvalidDocumentTransitionActionError extends ConsensusError {
  /**
   * @param {RawDocumentsStateTransition} rawStateTransition
   */
  constructor(rawStateTransition) {
    super('Invalid document transition action');

    this.rawStateTransition = rawStateTransition;
  }

  /**
   * Get raw State Transition
   *
   * @return {RawDocumentsStateTransition}
   */
  getRawStateTransition() {
    return this.rawStateTransition;
  }
}

module.exports = InvalidDocumentTransitionActionError;
