const ConsensusError = require('./ConsensusError');

class InvalidBufferEncodingError extends ConsensusError {
  /**
   *
   * @param {string} encoding
   */
  constructor(encoding) {
    super(`Invalid buffer encoding: ${encoding}`);

    this.encoding = encoding;
  }

  /**
   *
   * @return {string}
   */
  getEncoding() {
    return this.encoding;
  }
}

module.exports = InvalidBufferEncodingError;
