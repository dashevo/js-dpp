const AbstractIndexError = require('./AbstractIndexError');

class SingleSystemPropertyIndexError extends AbstractIndexError {
  /**
   * @param {RawDataContract} rawDataContract
   * @param {string} documentType
   * @param {Object} indexDefinition
   * @param {string} propertyName
   */
  constructor(rawDataContract, documentType, indexDefinition, propertyName) {
    const message = `'${propertyName}' is a system field and can be used only in a composite index`;

    super(
      message,
      rawDataContract,
      documentType,
      indexDefinition,
    );

    this.propertyName = propertyName;
  }

  /**
   * Get property name
   *
   * @return {string}
   */
  getPropertyName() {
    return this.propertyName;
  }
}

module.exports = SingleSystemPropertyIndexError;
