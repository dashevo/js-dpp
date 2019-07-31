const DataTriggerExecutionError = require('./DataTriggerExecutionError');

class DataTriggerInvalidDocumentTypeError extends DataTriggerExecutionError {
  /**
   * @param {Document} document
   * @param {DataTriggerExecutionContext} context
   * @param {number} action
   * @param {string} message
   */
  constructor(document, context, action, message = "Document type doesn't match trigger type") {
    super(document, context, action, message);
  }
}

module.exports = DataTriggerInvalidDocumentTypeError;
