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
   * @param {DataTriggerExecutionContext} context
   * @returns {DataTrigger}
   */
  setContext(context) {
    this.context = context;

    return this;
  }

  /**
   *
   * @param {Document} document
   * @returns {Promise<DataTriggerExecutionResult>}
   */
  execute(document) {
    return this.trigger(document, this.context);
  }
}

module.exports = DataTrigger;
