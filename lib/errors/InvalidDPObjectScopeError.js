const ConsensusError = require('./ConsensusError');

class InvalidDPObjectScopeError extends ConsensusError {
  /**
   * @param {Document} dpObject
   */
  constructor(dpObject) {
    super('Invalid DP Object scope');

    this.dpObject = dpObject;
  }

  /**
   * Get Document
   *
   * @return {Document}
   */
  getDPObject() {
    return this.dpObject;
  }
}

module.exports = InvalidDPObjectScopeError;
