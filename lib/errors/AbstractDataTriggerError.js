const ConsensusError = require('./ConsensusError');

/**
 * @abstract
 */
class AbstractDataTriggerError extends ConsensusError {
  /**
   * @param {string} message
   * @param {DataTriggerExecutionContext} context
   */
  constructor(message, context) {
    super(message);

    this.context = context;
  }

  /**
   * Get data trigger execution context
   *
   * @return {DataTriggerExecutionContext}
   */
  getContext() {
    return this.context;
  }
}

module.exports = AbstractDataTriggerError;
