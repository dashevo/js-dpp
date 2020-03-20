const ConsensusError = require('./ConsensusError');

class DuplicateDocumentError extends ConsensusError {
  /**
   * @param {DocumentCreateTransition[]|DocumentReplaceTransition[]} actionTransition
   * @param {Object} indexDefinition
   */
  constructor(actionTransition, indexDefinition) {
    super('Duplicate Document found');

    this.actionTransition = actionTransition;
    this.indexDefinition = indexDefinition;
  }

  /**
   * Get document action transition
   *
   * @return {DocumentCreateTransition[]|DocumentReplaceTransition[]}
   */
  getActionTransition() {
    return this.actionTransition;
  }

  /**
   * Get index definition
   *
   * @return {Object}
   */
  getIndexDefinition() {
    return this.indexDefinition;
  }
}

module.exports = DuplicateDocumentError;
