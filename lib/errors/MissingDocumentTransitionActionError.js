const ConsensusError = require('./ConsensusError');

class MissingDocumentTransitionActionError extends ConsensusError {
  constructor(rawDocumentTransition) {
    super('$action is not present');

    this.rawDocumentTransition = rawDocumentTransition;
  }

  /**
   * Get raw Document
   *
   * @return {Object}
   */
  getRawDocumentTransition() {
    return this.rawDocumentTransition;
  }
}

module.exports = MissingDocumentTransitionActionError;
