const ConsensusError = require('./ConsensusError');

class DataTriggerExecutionError extends ConsensusError {
  /**
   * @param {Document} document
   * @param {DataTriggerExecutionContext} context
   * @param {string} message
   */
  constructor(document, context, message = "Data trigger haven't finished successfully") {
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
