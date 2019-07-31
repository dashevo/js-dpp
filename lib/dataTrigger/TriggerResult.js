class TriggerResult {
  /**
   * @param {boolean} result
   * @param {string} message
   */
  constructor(result = false, message = '') {
    this.result = result;
    this.message = message;
  }

  /**
   * @param {string} message
   */
  setMessage(message) {
    this.message = message;
  }

  /**
   * @param {boolean} result
   */
  setResult(result) {
    this.result = result;
  }

  /**
   * @returns {string}
   */
  getMessage() {
    return this.message;
  }

  /**
   * @returns {boolean}
   */
  isOk() {
    return this.result;
  }
}

module.exports = TriggerResult;
