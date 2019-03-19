const ConsensusError = require('./ConsensusError');

class MissingDPObjectTypeError extends ConsensusError {
  constructor(rawDocument) {
    super('$type is not present');

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

module.exports = MissingDPObjectTypeError;
