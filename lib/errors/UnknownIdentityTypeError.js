const ConsensusError = require('./ConsensusError');

class UnknownIdentityTypeError extends ConsensusError {
  /**
   * @param {IdentityCreateTransition} stateTransition
   */
  constructor(stateTransition) {
    super('Identity type is within the reserved types range, but is unknown to the protocol');

    this.stateTransition = stateTransition;
  }

  /**
   * Get failed state transition
   *
   * @return {IdentityCreateTransition}
   */
  getStateTransition() {
    return this.stateTransition;
  }
}

module.exports = UnknownIdentityTypeError;
