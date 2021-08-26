const AbstractDataTriggerError = require('./AbstractDataTriggerError');

class DataTriggerInvalidResultError extends AbstractDataTriggerError {
  /**
   * @param {Buffer} dataContractId
   * @param {Buffer} documentTransitionId
   */
  constructor(dataContractId, documentTransitionId) {
    super(dataContractId, documentTransitionId, 'Data trigger have not returned any result');
  }
}

module.exports = DataTriggerInvalidResultError;
