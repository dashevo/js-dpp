const ConsensusError = require('./ConsensusError');

class DuplicatedIdentityPublicKeyError extends ConsensusError {
  /**
   * @param {RawPublicKey[]} rawPublicKeys
   */
  constructor(rawPublicKeys) {
    super('Duplicated public keys found');

    this.rawPublicKeys = rawPublicKeys;
  }

  /**
   * Get public keys
   *
   * @return {RawPublicKey[]}
   */
  getRawPublicKeys() {
    return this.rawPublicKeys;
  }
}

module.exports = DuplicatedIdentityPublicKeyError;
