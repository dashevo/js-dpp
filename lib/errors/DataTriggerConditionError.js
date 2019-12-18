const AbstractDataTriggerError = require('./AbstractDataTriggerError');

class DataTriggerConditionError extends AbstractDataTriggerError {
  /**
   * @param {Document} document
   * @param {DataTriggerExecutionContext} context
   * @param {string} message
   */
  constructor(document, context, message) {
    super(message, context);

    this.document = document;
  }

  /**
   * Get document
   *
   * @returns {Document}
   */
  getDocument() {
    return this.document;
  }
}

module.exports = DataTriggerConditionError;
