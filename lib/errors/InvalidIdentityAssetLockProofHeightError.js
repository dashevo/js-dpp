const ConsensusError = require('./ConsensusError');

class InvalidIdentityAssetLockProofHeightError extends ConsensusError {
  /**
   *
   * @param {number} proofCoreChainLockedHeight
   * @param {number} currentCoreChainLockedHeight
   */
  constructor(proofCoreChainLockedHeight, currentCoreChainLockedHeight) {
    super('Asset lock proof height is greater than consensus height');

    this.proofCoreChainLockedHeight = proofCoreChainLockedHeight;
    this.currentCoreChainLockedHeight = currentCoreChainLockedHeight;
  }

  /**
   *
   * @returns {number}
   */
  getProofCoreChainLockedHeight() {
    return this.proofCoreChainLockedHeight;
  }

  /**
   *
   * @returns {number}
   */
  getCurrentCoreChainLockedHeight() {
    return this.currentCoreChainLockedHeight;
  }
}

module.exports = InvalidIdentityAssetLockProofHeightError;
