class DataTriggerExecutionResult {
  constructor() {
    /**
     * @type {DataTriggerExecutionError[]}
     */
    this.errors = [];
    this.result = {};
  }

  /**
   * @param {DataTriggerExecutionError} error
   */
  addError(error) {
    this.errors.push(error);
  }
}

module.exports = DataTriggerExecutionResult;
