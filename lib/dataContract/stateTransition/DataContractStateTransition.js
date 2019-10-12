const AbstractStateTransition = require('../../stateTransition/AbstractStateTransition');

class DataContractStateTransition extends AbstractStateTransition {
  /**
   * @param {DataContract} dataContract
   */
  constructor(dataContract) {
    super();

    this.dataContract = dataContract;
  }

  /**
   * Get State Transition type
   *
   * @return {number}
   */
  getType() {
    return 1;
  }

  /**
   * Get Data Contract
   *
   * @return {DataContract}
   */
  getDataContract() {
    return this.dataContract;
  }

  /**
   * Set Data Contract
   *
   * @param {DataContract} dataContract
   * @return {DataContractStateTransition}
   */
  setDataContract(dataContract) {
    this.dataContract = dataContract;

    return this;
  }
}

module.exports = DataContractStateTransition;
