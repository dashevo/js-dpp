const ConsensusError = require('./ConsensusError');

class IncorrectIdentityTypeError extends ConsensusError {
  /**
   * @param {Identity|RawIdentity} identity
   */
  constructor(identity) {
    super('Identity type is within the reserved types range, but is unknown to the protocol');

    this.identity = identity;
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
