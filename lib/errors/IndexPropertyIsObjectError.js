const AbstractIndexError = require('./AbstractIndexError');

class IndexPropertyIsObjectError extends AbstractIndexError {
  /**
   * @param {RawDataContract} rawDataContract
   * @param {string} documentType
   * @param {Object} indexDefinition
   * @param {string} propertyName
   */
  constructor(rawDataContract, documentType, indexDefinition, propertyName) {
    const message = `'${propertyName}' property is an object and can not be used as index`;

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

module.exports = IndexPropertyIsObjectError;
