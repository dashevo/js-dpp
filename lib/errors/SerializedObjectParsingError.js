const ConsensusError = require('./ConsensusError');

class SerializedObjectParsingError extends ConsensusError {
  /**
   * @param {string} objectType
   * @param {Buffer|string} payload
   * @param {Error} parsingError
   */
  constructor(objectType, payload, parsingError) {
    super(
      `Parsing of a serialized ${objectType} failed due to: ${parsingError.message}`,
    );

    this.objectType = objectType;
    this.payload = payload;
    this.parsingError = parsingError;
  }

  /**
   * Get object type
   *
   * @return {string}
   */
  getObjectType() {
    return this.objectType;
  }

  /**
   * Get object payload
   *
   * @return {Buffer|string}
   */
  getPayload() {
    return this.payload;
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

SerializedObjectParsingError.OBJECT_TYPE = {
  DATA_CONTRACT: 'data contract',
  DOCUMENT: 'document',
  IDENTITY: 'identity',
  STATE_TRANSITION: 'state transition',
};

module.exports = SerializedObjectParsingError;
