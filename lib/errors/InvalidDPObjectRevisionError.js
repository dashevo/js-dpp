const ConsensusError = require('./ConsensusError');

class InvalidDPObjectRevisionError extends ConsensusError {
  /**
   * @param {Document} dpObject
   * @param {Document} fetchedDPObject
   */
  constructor(dpObject, fetchedDPObject) {
    super('Invalid DP Object revision');

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

module.exports = InvalidDPObjectRevisionError;
