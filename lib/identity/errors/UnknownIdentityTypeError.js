const ConsensusError = require('../../errors/ConsensusError');

class UnknownIdentityTypeError extends ConsensusError {
  /**
   * @param {IdentityCreateStateTransition} stateTransition
   */
  constructor(stateTransition) {
    super('Identity type is within the reserved types range, but is unknown to the protocol');

    this.name = this.constructor.name;

    this.stateTransition = stateTransition;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
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
