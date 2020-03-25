const ConsensusError = require('./ConsensusError');

class InvalidStateTransitionSignatureError extends ConsensusError {
  /**
   * @param {
   * DataContractCreateTransition|
   * DocumentsStateTransition|
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
   * @return {DataContractCreateTransition|DocumentsStateTransition|IdentityCreateTransition}
   */
  getRawStateTransition() {
    return this.stateTransition;
  }
}

module.exports = InvalidStateTransitionSignatureError;
