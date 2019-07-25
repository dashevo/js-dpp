const DataTriggerExecutionResult = require('./DataTriggerExecutionResult');
const DataTriggerExecutionError = require('../errors/DataTriggerExecutionError');

class DataTrigger {
  /**
   *
   * @param {string} documentType
   * @param {number} documentAction
   * @param {trigger} trigger
   */
  constructor(documentType, documentAction, trigger) {
    this.documentType = documentType;
    this.documentAction = documentAction;
    this.trigger = trigger;
  }

  /**
   *
   * @param {Document} document
   * @param {DataTriggerExecutionContext} context
   * @returns {Promise<DataTriggerExecutionResult>}
   */
  execute(document, context) {
    const isCorrectType = document.getType() === this.documentType;
    const isCorrectAction = document.getAction() === this.documentAction;
    if (!isCorrectType) {
      return new DataTriggerExecutionResult([
        new DataTriggerExecutionError(document, context, "Document type doesn't match trigger type"),
      ]);
    }
    if (!isCorrectAction) {
      return new DataTriggerExecutionResult([
        new DataTriggerExecutionError(document, context, "Document action doesn't match trigger action"),
      ]);
    }
    return this.trigger(document, context);
  }
}

module.exports = DataTrigger;
