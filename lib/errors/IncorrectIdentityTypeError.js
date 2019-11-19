const ConsensusError = require('./ConsensusError');

class IncorrectIdentityTypeError extends ConsensusError {
  /**
   * @param {Identity|RawIdentity} identity
   */
  constructor(identity) {
    super('Identity type is within the reserved types range, but is unknown to the protocol');

    this.name = this.constructor.name;

    this.identity = identity;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Get identity
   *
   * @return {Identity|RawIdentity}
   */
  getIdentity() {
    return this.identity;
  }
}

module.exports = IncorrectIdentityTypeError;
