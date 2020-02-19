const ConsensusError = require('./ConsensusError');

class DataSerializationError extends ConsensusError {
  /**
   * @param {string} message
   * @param {*} payload
   */
  constructor(message, payload) {
    super(message);

    this.payload = payload;
  }

  /**
   * @return {*}
   */
  getPayload() {
    return this.payload;
  }
}

module.exports = DataSerializationError;
