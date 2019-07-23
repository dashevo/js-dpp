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

  /**
   * Get all data trigger execution errors
   * @return {DataTriggerExecutionError[]}
   */
  getErrors() {
    return this.errors;
  }

  /**
   * @return {boolean}
   */
  isOk() {
    return !this.errors.length;
  }
}

module.exports = DataTriggerExecutionResult;
