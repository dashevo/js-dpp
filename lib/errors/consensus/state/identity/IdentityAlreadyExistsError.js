const AbstractStateError = require('../AbstractStateError');
const Identifier = require('../../../../identifier/Identifier');

class IdentityAlreadyExistsError extends AbstractStateError {
  /**
   * @param {Buffer} identityId
   */
  constructor(identityId) {
    super(`Identity ${Identifier.from(identityId)} already exists`);

    this.identityId = identityId;
  }

  /**
   * Get identity id
   *
   * @return {Buffer}
   */
  getIdentityId() {
    return this.identityId;
  }
}

module.exports = IdentityAlreadyExistsError;
