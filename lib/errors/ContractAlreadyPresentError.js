const ConsensusError = require('./ConsensusError');

class ContractAlreadyPresentError extends ConsensusError {
  /**
   * @param {Contract} dpContract
   */
  constructor(dpContract) {
    super('Contract is already present');

    this.dpContract = dpContract;
  }

  /**
   * Get Contract
   *
   * @return {Contract}
   */
  getDPContract() {
    return this.dpContract;
  }
}

module.exports = ContractAlreadyPresentError;
