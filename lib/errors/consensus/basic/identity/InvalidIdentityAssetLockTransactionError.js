const AbstractBasicError = require('../AbstractBasicError');

class InvalidIdentityAssetLockTransactionError extends AbstractBasicError {
  /**
   * @param {string} errorMessage
   */
  constructor(errorMessage) {
    super(`Invalid asset lock transaction: ${errorMessage}`);

    this.errorMessage = errorMessage;
  }

  /**
   * @returns {string}
   */
  getErrorMessage() {
    return this.errorMessage;
  }
}

module.exports = InvalidIdentityAssetLockTransactionError;
