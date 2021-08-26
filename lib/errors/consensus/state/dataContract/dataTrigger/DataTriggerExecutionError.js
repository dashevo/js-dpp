const AbstractDataTriggerError = require('./AbstractDataTriggerError');

class DataTriggerExecutionError extends AbstractDataTriggerError {
  /**
   * @param {Buffer} dataContractId
   * @param {Buffer} documentTransitionId
   * @param {Object} error
   */
  constructor(dataContractId, documentTransitionId, error) {
    super(dataContractId, documentTransitionId, error.message);

    this.error = error;
  }

  /**
   * Return internal error instance
   *
   * @return {Object}
   */
  getError() {
    return this.error;
  }
}

module.exports = DataTriggerExecutionError;
