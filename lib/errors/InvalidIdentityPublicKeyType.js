const ConsensusError = require('./ConsensusError');

class InvalidIdentityPublicKeyType extends ConsensusError {
  /**
   * @param {number} type
   */
  constructor(type) {
    super(`Invalid identity public key type ${type}`);

    this.type = type;
  }

  /**
   * Get identity public key type
   *
   * @return {number}
   */
  getType() {
    return this.type;
  }
}

module.exports = InvalidIdentityPublicKeyType;
