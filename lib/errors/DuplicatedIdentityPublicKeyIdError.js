const ConsensusError = require('./ConsensusError');

class DuplicatedIdentityPublicKeyIdError extends ConsensusError {
  /**
   * @param {RawPublicKey[]} rawPublicKeys
   */
  constructor(rawPublicKeys) {
    super('Duplicated public key ids found');

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

module.exports = DuplicatedIdentityPublicKeyIdError;
