const DataTriggerExecutionError = require('./DataTriggerExecutionError');

class DataTriggerInvalidDocumentActionError extends DataTriggerExecutionError {
  /**
   * @param {Document} document
   * @param {DataTriggerExecutionContext} context
   * @param {number} action
   * @param {string} message
   */
  constructor(document, context, action, message = "Document action doesn't match trigger action") {
    super(document, context, action, message);
  }
}

module.exports = DataTriggerInvalidDocumentActionError;
