const AbstractStateError = require('../AbstractStateError');

class IdentityPublicKeyAlreadyExistsError extends AbstractStateError {
  /**
   * @param {Buffer} publicKeyHash
   */
  constructor(publicKeyHash) {
    super(`Identity public key ${publicKeyHash.toString('hex')} already exists`);

    this.publicKeyHash = publicKeyHash;
  }

  /**
   * Get public key hash
   *
   * @return {Buffer}
   */
  getPublicKeyHash() {
    return this.publicKeyHash;
  }
}

module.exports = IdentityPublicKeyAlreadyExistsError;
