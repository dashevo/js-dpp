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
    this.context = null;
  }

  /**
   *
   * @param {Document} document
   * @param {DataTriggerExecutionContext} context
   * @returns {Promise<DataTriggerExecutionResult>}
   */
  execute(document, context) {
    return this.trigger(document, context);
  }
}

module.exports = DataTrigger;
