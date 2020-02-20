const ConsensusError = require('./ConsensusError');

class DataContractMaxByteSizeExceededError extends ConsensusError {
  /**
   * @param {RawDataContract} dataContract
   * @param {number} sizeLimit
   */
  constructor(dataContract, sizeLimit) {
    super(`Maximum Data Contract size of ${sizeLimit} bytes is reached`);

    this.dataContract = dataContract;
    this.sizeLimit = sizeLimit;
  }

  /**
   * Get data contract
   *
   * @return {RawDataContract}
   */
  getDataContract() {
    return this.dataContract;
  }

  /**
   * Get maximum byte size
   *
   * @return {number}
   */
  getSizeLimit() {
    return this.sizeLimit;
  }
}

module.exports = DataContractMaxByteSizeExceededError;
