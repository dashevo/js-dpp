const AbstractBasicError = require('../AbstractBasicError');
const Identifier = require('../../../../identifier/Identifier');

class DuplicateDocumentTransitionsWithIdsError extends AbstractBasicError {
  /**
   * @param {
   *   [string, Buffer][]
   * } documentTransitionReferences
   */
  constructor(documentTransitionReferences) {
    const references = documentTransitionReferences
      .map(([type, id]) => `${type} ${Identifier.from(id)}`).join(', ');

    super(`Document transitions with duplicate IDs: ${references}`);

    this.documentTransitionReferences = documentTransitionReferences;
  }

  /**
   * Get duplicate raw transition references
   *
   * @return {
   *   [string, Buffer][]
   * }
   */
  getDocumentTransitionReferences() {
    return this.documentTransitionReferences;
  }
}

module.exports = DuplicateDocumentTransitionsWithIdsError;
