const DataTriggerExecutionResult = require('./DataTriggerExecutionResult');
const DataTriggerExecutionError = require('../errors/DataTriggerExecutionError');
const DataTriggerInvalidDocumentActionError = require('../errors/DataTriggerInvalidDocumentActionError');
const DataTriggerInvalidDocumentTypeError = require('../errors/DataTriggerInvalidDocumentTypeError');

class DataTrigger {
  /**
   *
   * @param {string} documentType
   * @param {number} documentAction
   * @param {Contract} contract
   * @param {function(Document, DataTriggerExecutionContext):DataTriggerExecutionResult} trigger
   */
  constructor(documentType, documentAction, trigger, contract) {
    this.documentType = documentType;
    this.documentAction = documentAction;
    this.trigger = trigger;
    this.contract = contract;
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
    const isCorrectContract = this.contract.getId() === context.getContract().getId();
    if (!isCorrectType) {
      return new DataTriggerExecutionResult([
        new DataTriggerInvalidDocumentTypeError(document, context, this.documentAction),
      ]);
    }

    if (!isCorrectAction) {
      return new DataTriggerExecutionResult([
        new DataTriggerInvalidDocumentActionError(document, context, this.documentAction),
      ]);
    }

    if (!isCorrectContract) {
      return new DataTriggerExecutionResult([
        new DataTriggerInvalidDocumentTypeError(document, context, this.documentAction),
      ]);
    }

    const result = new DataTriggerExecutionResult();
    const isDataTriggerExecutedSuccessfully = await this.trigger(document, context);
    if (isDataTriggerExecutedSuccessfully.isOk() === false) {
      result.addError(new DataTriggerExecutionError(
        document, context, this.documentAction, isDataTriggerExecutedSuccessfully.getMessage(),
      ));
    }

    return result;
  }
}

module.exports = DataTrigger;
