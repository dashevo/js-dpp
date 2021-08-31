const AbstractConsensusError = require('../../AbstractConsensusError');

class ProtocolVersionParsingError extends AbstractConsensusError {
  /**
   * @param {Error} parsingError
   */
  constructor(parsingError) {
    super(
      `Can't read protocol version from serialized object: ${parsingError.message}`,
    );

    this.parsingError = parsingError;
  }

  /**
   * Get parsing error
   *
   * @return {Error}
   */
  getParsingError() {
    return this.parsingError;
  }
}

module.exports = ProtocolVersionParsingError;
