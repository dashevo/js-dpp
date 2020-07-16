const AbstractIndexError = require('./AbstractIndexError');

class MissingIndexedPropertyConstraintError extends AbstractIndexError {
  /**
   * @param {RawDataContract} rawDataContract
   * @param {string} documentType
   * @param {Object} indexDefinition
   * @param {string} propertyName
   * @param {string} constraintName
   */
  constructor(rawDataContract, documentType, indexDefinition, propertyName, constraintName) {
    const message = `Indexed property '${propertyName}' missing mandatory constraint '${constraintName}'`;

    super(
      message,
      rawDataContract,
      documentType,
      indexDefinition,
    );

    this.propertyName = propertyName;
    this.constraintName = constraintName;
  }

  /**
   * Get property name
   *
   * @return {string}
   */
  getPropertyName() {
    return this.propertyName;
  }

  /**
   * Get property constraint name
   *
   * @return {string}
   */
  getConstraintName() {
    return this.constraintName;
  }
}

module.exports = MissingIndexedPropertyConstraintError;
