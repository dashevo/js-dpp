const AbstractBasicError = require('./AbstractBasicError');

class InvalidIdentifierError extends AbstractBasicError {
  /**
   * @param {string} identifierName
   * @param {string} errorMessage
   */
  constructor(identifierName, errorMessage) {
    super(`Invalid ${identifierName}: ${errorMessage}`);

    this.identifierName = identifierName;
    this.errorMessage = errorMessage;
  }

  /**
   * Get identifier name
   *
   * @return {string}
   */
  getIdentifierName() {
    return this.identifierName;
  }

  /**
   * Get identifier error message
   *
   * @return {string}
   */
  getErrorMessage() {
    return this.errorMessage;
  }
}

module.exports = InvalidIdentifierError;
