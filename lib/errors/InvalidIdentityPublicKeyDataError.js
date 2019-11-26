const ConsensusError = require('./ConsensusError');

class InvalidIdentityPublicKeyDataError extends ConsensusError {
  /**
   * @param {IdenityPublicKey} publicKey
   * @param {Error} validationError
   */
  constructor(publicKey, validationError) {
    super(`Invalid identity public key data ${publicKey.getData()}`);

    this.publicKey = publicKey;
    this.validationError = validationError;
  }

  /**
   * Get identity public key
   *
   * @return {IdentityPublicKey}
   */
  getPublicKey() {
    return this.publicKey;
  }

  /**
   * Get public key data validation error
   *
   * @return {}
   */
  getValidationError() {
    return this.validationError;
  }
}

module.exports = InvalidIdentityPublicKeyDataError;
