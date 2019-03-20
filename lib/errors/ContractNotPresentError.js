const ConsensusError = require('./ConsensusError');

class ContractNotPresentError extends ConsensusError {
  /**
   * @param {string} dpContractId
   */
  constructor(dpContractId) {
    super('Contract is not present with contract ID specified in ST Packet');

    this.dpContractId = dpContractId;
  }

  /**
   * Get contract ID
   *
   * @return {string}
   */
  getDPContractId() {
    return this.dpContractId;
  }
}

module.exports = ContractNotPresentError;
