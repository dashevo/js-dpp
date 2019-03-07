class DuplicateDPObjectsByIndicesError extends Error {
  /**
   * @param {Object[]} duplicateRawDPObjects
   */
  constructor(duplicateRawDPObjects) {
    super('Duplicate DPObjects found in ST Packet under unique indices constraint');

    this.duplicateRawDPObjects = duplicateRawDPObjects;
  }

  /**
   * Get duplicate raw DPObjects
   *
   * @return {Object[]}
   */
  getDuplicateRawDPObjects() {
    return this.duplicateRawDPObjects;
  }
}

module.exports = DuplicateDPObjectsByIndicesError;
