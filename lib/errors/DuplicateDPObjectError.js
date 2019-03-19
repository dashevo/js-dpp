const ConsensusError = require('./ConsensusError');

class DuplicateDPObjectError extends ConsensusError {
  /**
   * @param {Document} dpObject
   * @param {Object} indexDefinition
   */
  constructor(dpObject, indexDefinition) {
    super('Duplicate DP Object found');

    this.dpObject = dpObject;
    this.indexDefinition = indexDefinition;
  }

  /**
   * Get Document
   *
   * @return {Document}
   */
  getDPObject() {
    return this.dpObject;
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

module.exports = DuplicateDPObjectError;
