const AbstractBasicError = require('../AbstractBasicError');

class InvalidDocumentTransitionActionError extends AbstractBasicError {
  /**
   * @param {number} action
   */
  constructor(action) {
    super(`Document transition action ${action} is not supported`);

    this.action = action;
  }

  /**
   * Get action
   *
   * @return {*}
   */
  getAction() {
    return this.action;
  }
}

module.exports = InvalidDocumentTransitionActionError;
