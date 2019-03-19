const ConsensusError = require('./ConsensusError');

class DPObjectAlreadyPresentError extends ConsensusError {
  /**
   * @param {Document} dpObject
   * @param {Document} fetchedDPObject
   */
  constructor(dpObject, fetchedDPObject) {
    super('DP Object with the same ID is already present');

    this.dpObject = dpObject;
    this.fetchedDPObject = fetchedDPObject;
  }

  /**
   * Get DP Object
   *
   * @return {Document}
   */
  getDPObject() {
    return this.dpObject;
  }

  /**
   * Get fetched DP Object
   *
   * @return {Document}
   */
  getFetchedDPObject() {
    return this.fetchedDPObject;
  }
}

module.exports = DPObjectAlreadyPresentError;
