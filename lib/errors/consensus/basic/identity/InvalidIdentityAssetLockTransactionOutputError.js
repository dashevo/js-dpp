const AbstractBasicError = require('../AbstractBasicError');

class InvalidIdentityAssetLockTransactionOutputError extends AbstractBasicError {
  /**
   * @param {number} outputIndex
   */
  constructor(outputIndex) {
    super(`Asset lock output ${outputIndex} is not a valid standard OP_RETURN output`);

    this.outputIndex = outputIndex;
  }

  /**
   * Get lock transaction output
   *
   * @return {number}
   */
  getOutputIndex() {
    return this.outputIndex;
  }
}

module.exports = InvalidIdentityAssetLockTransactionOutputError;
