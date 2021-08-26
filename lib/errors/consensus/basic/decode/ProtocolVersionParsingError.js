const ConsensusError = require('../../ConsensusError');

class ProtocolVersionParsingError extends ConsensusError {
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
