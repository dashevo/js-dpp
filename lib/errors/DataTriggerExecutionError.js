const AbstractDataTriggerError = require('./AbstractDataTriggerError');

class DataTriggerExecutionError extends AbstractDataTriggerError {
  /**
   * @param {DataTrigger} dataTrigger
   * @param {DataTriggerExecutionContext} context
   * @param {Error} error
   */
  constructor(dataTrigger, context, error) {
    super(error.message, context);

    this.error = error;
    this.dataTrigger = dataTrigger;
  }

  /**
   * Return internal error instance
   *
   * @return {Error}
   */
  getError() {
    return this.error;
  }

  /**
   * Get data trigger
   *
   * @return {DataTrigger}
   */
  getDataTrigger() {
    return this.dataTrigger;
  }
}

module.exports = DataTriggerExecutionError;
