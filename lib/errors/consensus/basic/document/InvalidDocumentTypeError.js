const AbstractBasicError = require('../AbstractBasicError');

class InvalidDocumentTypeError extends AbstractBasicError {
  /**
   * @param {string} type
   * @param {Identifier} dataContractId
   */
  constructor(type, dataContractId) {
    super(`Data Contract ${dataContractId} doesn't define document with type ${type}`);

    this.type = type;
    this.dataContractId = dataContractId;
  }

  /**
   * Get type
   *
   * @return {string}
   */
  getType() {
    return this.type;
  }

  /**
   * Get Data Contract ID
   *
   * @return {Identifier}
   */
  getDataContractId() {
    return this.dataContractId;
  }
}

module.exports = InvalidDocumentTypeError;
