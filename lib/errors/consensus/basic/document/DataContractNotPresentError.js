const AbstractBasicError = require('../AbstractBasicError');
const Identifier = require('../../../../identifier/Identifier');

class DataContractNotPresentError extends AbstractBasicError {
  /**
   * @param {Buffer} dataContractId
   */
  constructor(dataContractId) {
    const dataContractIdentifier = Identifier.from(dataContractId);

    super(`Data Contract ${dataContractIdentifier} is not present`);

    this.dataContractId = dataContractIdentifier;
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

module.exports = DataContractNotPresentError;
