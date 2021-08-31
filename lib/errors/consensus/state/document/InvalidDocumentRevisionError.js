const AbstractStateError = require('../AbstractStateError');
const Identifier = require('../../../../identifier/Identifier');

class InvalidDocumentRevisionError extends AbstractStateError {
  /**
   * @param {Buffer} documentId
   * @param {number} currentRevision
   */
  constructor(documentId, currentRevision) {
    super(`Document ${Identifier.from(documentId)} has invalid revision. The current revision is ${currentRevision}`);

    this.documentId = documentId;
    this.currentRevision = currentRevision;
  }

  /**
   * Get Document ID
   *
   * @return {Buffer}
   */
  getDocumentId() {
    return this.documentId;
  }

  /**
   * Get current revision
   *
   * @return {number}
   */
  getCurrentRevision() {
    return this.currentRevision;
  }
}

module.exports = InvalidDocumentRevisionError;
