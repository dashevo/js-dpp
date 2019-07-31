const ConsensusError = require('./ConsensusError');

class DataTriggerExecutionError extends ConsensusError {
  /**
   * @param {Document} document
   * @param {DataTriggerExecutionContext} context
   * @param {number} action
   * @param {string} message
   */
  constructor(document, context, action, message = "Data trigger haven't finished successfully") {
    super(message);

    this.context = context;
    this.document = document;
    this.action = action;
  }

  /**
   * @return {DataTriggerExecutionContext}
   */
  getContext() {
    return this.context;
  }

  /**
   * @return {Document}
   */
  getDocument() {
    return this.document;
  }

  /**
   * @return {number}
   */
  getAction() {
    return this.action;
  }
}

module.exports = DataTriggerExecutionError;
