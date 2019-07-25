const DataTriggerExecutionResult = require('./DataTriggerExecutionResult');
const DataTriggerExecutionError = require('../errors/DataTriggerExecutionError');

class DataTrigger {
  /**
   *
   * @param {string} documentType
   * @param {number} documentAction
   * @param {function(Document, DataTriggerExecutionContext):DataTriggerExecutionResult} trigger
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
  async execute(document, context) {
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

    let isDataTriggerExecutedSuccessfully = false;
    const result = new DataTriggerExecutionResult();

    try {
      isDataTriggerExecutedSuccessfully = await this.trigger(document, context);
    } catch (error) {
      if (error instanceof DataTriggerExecutionError) {
        result.addError(error);
      } else {
        result.addError(new DataTriggerExecutionError(
          document, context, 'Unexpected error occurred while executing data trigger',
        ));
      }
    } finally {
      if (!isDataTriggerExecutedSuccessfully) {
        result.addError(new DataTriggerExecutionError(document, context));
      }
    }

    return result;
  }
}

module.exports = DataTrigger;
