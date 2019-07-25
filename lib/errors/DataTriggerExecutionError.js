const ConsensusError = require('./ConsensusError');

class DataTriggerExecutionError extends ConsensusError {
  /**
   * @param {Document} document
   * @param {DataTriggerExecutionContext} context
   * @param {string} message
   */
  constructor(document, context, message = 'Error occurred while executing Data Trigger') {
    super(message);

    this.context = context;
    this.document = document;
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
}

module.exports = DataTriggerExecutionError;
