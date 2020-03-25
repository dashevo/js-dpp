const ConsensusError = require('./ConsensusError');

class InvalidStateTransitionSignatureError extends ConsensusError {
  /**
   * @param {
   * DataContractStateTransition|
   * DocumentsBatchTransition|
   * IdentityCreateTransition
   * } stateTransition
   */
  constructor(stateTransition) {
    super(`Invalid State Transition signature ${stateTransition.getSignature()}`);

    this.stateTransition = stateTransition;
  }

  /**
   * Get State Transition
   *
   * @return {DataContractStateTransition|DocumentsBatchTransition|IdentityCreateTransition}
   */
  getRawStateTransition() {
    return this.stateTransition;
  }
}

module.exports = InvalidStateTransitionSignatureError;
