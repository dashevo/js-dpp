const AbstractBasicError = require('../AbstractBasicError');

class InvalidIdentityPublicKeyDataError extends AbstractBasicError {
  /**
   * @param {number} publicKeyId
   * @param {string} validationError
   */
  constructor(publicKeyId, validationError) {
    super(`Invalid identity public key ${publicKeyId} data: ${validationError}`);

    this.publicKeyId = publicKeyId;
    this.validationError = validationError;
  }

  /**
   * Get identity public key ID
   *
   * @return {number}
   */
  getPublicKeyId() {
    return this.publicKeyId;
  }

  /**
   * Get public key data validation error
   *
   * @return {string}
   */
  getValidationError() {
    return this.validationError;
  }
}

module.exports = InvalidIdentityPublicKeyDataError;
