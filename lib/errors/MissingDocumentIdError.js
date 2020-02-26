const ConsensusError = require('./ConsensusError');

class MissingDocumentIdError extends ConsensusError {
  constructor(rawDocument) {
    super('$id is not present');

    this.rawDocument = rawDocument;
  }

  /**
   * Get raw Document
   *
   * @return {RawDocument}
   */
  getRawDocument() {
    return this.rawDocument;
  }
}

module.exports = MissingDocumentIdError;
