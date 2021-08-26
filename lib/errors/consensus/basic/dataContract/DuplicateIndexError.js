const AbstractIndexError = require('./AbstractIndexError');

class DuplicateIndexError extends AbstractIndexError {
  /**
   * @param {string} documentType
   * @param {Object} indexDefinition
   */
  constructor(documentType, indexDefinition) {
    const message = `Duplicate index definition for "${documentType}" document`;

    super(
      message,
      documentType,
      indexDefinition,
    );
  }
}

module.exports = DuplicateIndexError;
