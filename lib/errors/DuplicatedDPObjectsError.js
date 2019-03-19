const ConsensusError = require('./ConsensusError');

class DuplicatedDPObjectsError extends ConsensusError {
  /**
   * @param {Object[]} duplicatedDocuments
   */
  constructor(duplicatedDocuments) {
    super('Duplicated Document in ST Packet');

    this.duplicatedDocuments = duplicatedDocuments;
  }

  /**
   * Get Duplicated Documents
   *
   * @return {Object[]}
   */
  getDuplicatedDocuments() {
    return this.duplicatedDocuments;
  }
}

module.exports = DuplicatedDPObjectsError;
