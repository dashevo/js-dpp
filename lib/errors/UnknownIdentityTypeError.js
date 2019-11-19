const ConsensusError = require('./ConsensusError');

class UnknownIdentityTypeError extends ConsensusError {
  /**
   * @param {IdentityCreateStateTransition} stateTransition
   */
  constructor(stateTransition) {
    super('Identity type is within the reserved types range, but is unknown to the protocol');

    this.stateTransition = stateTransition;
  }

  /**
   * Get failed state transition
   *
   * @return {IdentityCreateStateTransition}
   */
  getStateTransition() {
    return this.stateTransition;
  }
}

module.exports = UnknownIdentityTypeError;
