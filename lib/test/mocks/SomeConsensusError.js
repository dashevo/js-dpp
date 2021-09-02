const AbstractConsensusError = require('../../errors/consensus/AbstractConsensusError');

class SomeConsensusError extends AbstractConsensusError {
  /**
   * @returns {number}
   */
  getCode() {
    return Number.MAX_SAFE_INTEGER;
  }
}

module.exports = SomeConsensusError;
