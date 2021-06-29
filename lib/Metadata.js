class Metadata {
  /**
   * @param {number} blockHeight
   * @param {number} coreChainLockedHeight
   */
  constructor(blockHeight, coreChainLockedHeight) {
    this.blockHeight = blockHeight;
    this.coreChainLockedHeight = coreChainLockedHeight;
  }

  /**
   * Set block height
   * @param {number} blockHeight
   */
  setBlockHeight(blockHeight) {
    this.blockHeight = blockHeight;
  }

  /**
   * Get block height
   * @returns {number}
   */
  getBlockHeight() {
    return this.blockHeight;
  }

  /**
   * Set core chain-locked height
   * @param {number} coreChainLockedHeight
   */
  setCoreChainLockedHeight(coreChainLockedHeight) {
    this.coreChainLockedHeight = coreChainLockedHeight;
  }

  /**
   * Get core chain-locked height
   * @returns {number}
   */
  getCoreChainLockedHeight() {
    return this.coreChainLockedHeight;
  }
}

module.exports = Metadata;
