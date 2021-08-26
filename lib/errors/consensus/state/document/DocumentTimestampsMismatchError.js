const AbstractStateError = require('../AbstractStateError');
const Identifier = require('../../../../identifier/Identifier');

class DocumentTimestampsMismatchError extends AbstractStateError {
  /**
   * @param {Buffer} documentId
   */
  constructor(documentId) {
    super(`Document ${Identifier.from(documentId)} createdAt and updatedAt timestamps are not equal`);

    this.documentId = documentId;
  }

  /**
   * Get document create transition
   *
   * @return {Buffer}
   */
  getDocumentId() {
    return this.documentId;
  }
}

module.exports = DocumentTimestampsMismatchError;
