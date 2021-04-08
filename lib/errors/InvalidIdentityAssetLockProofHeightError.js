const ConsensusError = require('./ConsensusError');

class InvalidIdentityAssetLockProofHeightError extends ConsensusError {
  /**
   *
   * @param {number} height
   */
  constructor(height) {
    super('Asset lock proof height is greater than consensus height');

    this.height = height;
  }

  /**
   *
   * @returns {number}
   */
  getHeight() {
    return this.height;
  }
}

module.exports = InvalidIdentityAssetLockProofHeightError;
