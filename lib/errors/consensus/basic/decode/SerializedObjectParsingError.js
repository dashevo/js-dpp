const ConsensusError = require('../../ConsensusError');

class SerializedObjectParsingError extends ConsensusError {
  /**
   * @param {Error} parsingError
   */
  constructor(parsingError) {
    super(
      `Parsing of a serialized object failed due to: ${parsingError.message}`,
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

module.exports = SerializedObjectParsingError;
