const ConsensusError = require('./ConsensusError');

class InvalidStateTransitionSignatureError extends ConsensusError {
  /**
   * @param {DataContractStateTransition|DocumentsStateTransition} rawStateTransition
   */
  constructor(rawStateTransition) {
    super(`Invalid State Transition signature ${rawStateTransition.getSignature()}`);

    this.rawStateTransition = rawStateTransition;
  }

  /**
   * Get raw State Transition
   *
   * @return {RawDataContractStateTransition|RawDocumentsStateTransition}
   */
  getRawStateTransition() {
    return this.rawStateTransition;
  }
}

module.exports = InvalidStateTransitionSignatureError;
