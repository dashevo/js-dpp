const AbstractBasicError = require('../AbstractBasicError');

class StateTransitionMaxSizeExceededError extends AbstractBasicError {
  /**
   * @param {number} actualSizeKBytes
   * @param {number} maxSizeKBytes
   */
  constructor(actualSizeKBytes, maxSizeKBytes) {
    super(`State transition size ${actualSizeKBytes} Kb is more than maximum ${maxSizeKBytes} Kb`);

    this.actualSizeKBytes = actualSizeKBytes;
    this.maxSizeKBytes = maxSizeKBytes;
  }

  /**
   * Get actual state transition size in Kb
   *
   * @return {number}
   */
  getActualSizeKBytes() {
    return this.actualSizeKBytes;
  }

  /**
   * Get max state transition size in Kb
   *
   * @return {number}
   */
  getMaxSizeKBytes() {
    return this.maxSizeKBytes;
  }
}

module.exports = StateTransitionMaxSizeExceededError;
