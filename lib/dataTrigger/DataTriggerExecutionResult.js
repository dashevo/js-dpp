class DataTriggerExecutionResult {
  constructor() {
    /**
     * @type {DataTriggerExecutionError[]}
     */
    this.errors = [];
  }

  /**
   * @param {DataTriggerExecutionError} error
   */
  addError(error) {
    this.errors.push(error);
  }
}

module.exports = DataTriggerExecutionResult;
