const ConsensusError = require('./ConsensusError');

class MissingDPObjectActionError extends ConsensusError {
  constructor(rawDocument) {
    super('$action is not present');

    this.rawDocument = rawDocument;
  }

  /**
   * Get raw Document
   *
   * @return {Object}
   */
  getRawDocument() {
    return this.rawDocument;
  }
}

module.exports = MissingDPObjectActionError;
