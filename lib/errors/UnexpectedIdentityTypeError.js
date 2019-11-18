const ConsensusError = require('./ConsensusError');

class UnexpectedIdentityTypeError extends ConsensusError {
  /**
   * @param {RawIdentity|Identity} identity
   * @param {number} expectedIdentityType
   */
  constructor(identity, expectedIdentityType) {
    super('Unexpected identity type');

    this.identity = identity;
    this.expectedIdentityType = expectedIdentityType;
  }

  /**
   * Get identity
   *
   * @return {RawIdentity}
   */
  getIdentity() {
    return this.identity;
  }

  /**
   * Get expected identity type
   * @return {number}
   */
  getExpectedIdentityType() {
    return this.expectedIdentityType;
  }
}

module.exports = UnexpectedIdentityTypeError;
