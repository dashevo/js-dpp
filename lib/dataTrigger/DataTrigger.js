const DataTriggerExecutionResult = require('./DataTriggerExecutionResult');
const DataTriggerExecutionError = require('../errors/DataTriggerExecutionError');

class DataTrigger {
  /**
   * @param {Contract} contract
   * @param {Document} document
   * @param {function(Document, DataTriggerExecutionContext):DataTriggerExecutionResult} trigger
   */
  constructor(contract, document, trigger) {
    this.contract = contract;
    this.document = document;
    this.trigger = trigger;
  }

  /**
   * Execute data trigger
   *
   * @param {DataTriggerExecutionContext} context
   *
   * @returns {Promise<DataTriggerExecutionResult>}
   */
  async execute(context) {
    const result = new DataTriggerExecutionResult();

    try {
      const result = await this.trigger(this.document, context);
    } catch (e) {
      // pass
    }

    if (isDataTriggerExecutedSuccessfully.isOk() === false) {
      result.addError(
        new DataTriggerExecutionError(
          this.document, context, this.documentAction, isDataTriggerExecutedSuccessfully.getMessage(),
        ),
      );
    }

    return result;
  }
}

module.exports = DataTrigger;
