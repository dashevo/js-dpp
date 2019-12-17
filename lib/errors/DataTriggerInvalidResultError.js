const AbstractDataTriggerError = require('./AbstractDataTriggerError');

class DataTriggerInvalidResultError extends AbstractDataTriggerError {
  /**
   * @param {DataTrigger} dataTrigger
   * @param {DataTriggerExecutionContext} context
   */
  constructor(dataTrigger, context) {
    super('Data trigger have not returned any result', context);

    this.dataTrigger = dataTrigger;
  }

  /**
   * Get data trigger
   *
   * @returns {DataTrigger}
   */
  getDataTrigger() {
    return this.dataTrigger;
  }
}

module.exports = DataTriggerInvalidResultError;
