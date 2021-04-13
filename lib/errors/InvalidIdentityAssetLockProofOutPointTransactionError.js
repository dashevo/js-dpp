const ConsensusError = require('./ConsensusError');

class InvalidIdentityAssetLockProofOutPointTransactionError extends ConsensusError {
  /**
   *
   * @param {Buffer} outPoint
   */
  constructor(outPoint) {
    super('Asset lock proof outPoint transaction was not found');

    this.outPoint = outPoint;
  }

  /**
   *
   * @returns {Buffer}
   */
  getOutPoint() {
    return this.outPoint;
  }
}

module.exports = InvalidIdentityAssetLockProofOutPointTransactionError;
