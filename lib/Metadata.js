class Metadata {
  /**
   * @param {Object} metadataObject
   * @param {number} metadataObject.blockHeight
   * @param {number} metadataObject.coreChainLockedHeight
   */
  constructor(metadataObject) {
    this.blockHeight = metadataObject.blockHeight;
    this.coreChainLockedHeight = metadataObject.coreChainLockedHeight;
  }

  /**
   * Get block height
   * @returns {number}
   */
  getBlockHeight() {
    return this.blockHeight;
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
