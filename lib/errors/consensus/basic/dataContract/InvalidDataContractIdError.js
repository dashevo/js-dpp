const bs58 = require('bs58');

const AbstractBasicError = require('../AbstractBasicError');

const Identifier = require('../../../../identifier/Identifier');

class InvalidDataContractIdError extends AbstractBasicError {
  /**
   * @param {Buffer} expectedId
   * @param {Buffer} invalidId
   */
  constructor(expectedId, invalidId) {
    const expectedIdentifier = Identifier.from(expectedId);
    const invalidIdentifier = bs58.encode(invalidId);

    super(`Data Contract ID must be ${expectedIdentifier}, got ${invalidIdentifier}`);

    this.expectedId = expectedId;
    this.invalidId = invalidId;
  }

  /**
   * @return {Buffer}
   */
  getExpectedId() {
    return this.expectedId;
  }

  /**
   * @return {Buffer}
   */
  getInvalidId() {
    return this.invalidId;
  }
}

module.exports = InvalidDataContractIdError;
