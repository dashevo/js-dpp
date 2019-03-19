const ConsensusError = require('./ConsensusError');

class InvalidDPObjectScopeIdError extends ConsensusError {
  /**
   * @param {Object} rawDPObject
   */
  constructor(rawDPObject) {
    super('Invalid Document scopeId');

    this.rawDPObject = rawDPObject;
  }

  /**
   * Get raw Document
   *
   * @return {Object}
   */
  getRawDPObject() {
    return this.rawDPObject;
  }
}

module.exports = InvalidDPObjectScopeIdError;
