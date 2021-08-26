const AbstractBasicError = require('../AbstractBasicError');

class InvalidInstantAssetLockProofError extends AbstractBasicError {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(`Invalid instant lock proof: ${message}`);
  }
}

module.exports = InvalidInstantAssetLockProofError;
