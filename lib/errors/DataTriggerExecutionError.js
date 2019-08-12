const ConsensusError = require('./ConsensusError');

class DataTriggerExecutionError extends ConsensusError {
  /**
   * @param {Dot} document
   * @param {DataTriggerExecutionContext} context
   * @param {string} message
   */
  constructor(dataTrigger, context, message) {
    super(message);

    this.dataTrigger = dataTrigger;
    this.context = context;
  }

  /**
   * Get data trigger
   *
   * @returns {DataTrigger}
   */
  getDataTrigger() {
    return this.dataTrigger;
  }

  /**
   * Get data trigger execution context
   *
   * @return {DataTriggerExecutionContext}
   */
  getContext() {
    return this.context;
  }
}

module.exports = DataTriggerExecutionError;
