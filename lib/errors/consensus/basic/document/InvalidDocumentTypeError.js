const AbstractBasicError = require('../AbstractBasicError');
const Identifier = require('../../../../identifier/Identifier');

class InvalidDocumentTypeError extends AbstractBasicError {
  /**
   * @param {string} type
   * @param {Buffer} dataContractId
   */
  constructor(type, dataContractId) {
    super(`Data Contract ${Identifier.from(dataContractId)} doesn't define document with type ${type}`);

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
