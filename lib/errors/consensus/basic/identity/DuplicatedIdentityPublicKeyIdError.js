const AbstractBasicError = require('../AbstractBasicError');

class DuplicatedIdentityPublicKeyIdError extends AbstractBasicError {
  /**
   * @param {number[]} duplicatedIds
   */
  constructor(duplicatedIds) {
    super(`Duplicated public key ids ${duplicatedIds.join(', ')} found`);

    this.duplicatedIds = duplicatedIds;
  }

  /**
   * Get duplicated public key ids
   *
   * @return {number[]}
   */
  getDuplicatedIds() {
    return this.duplicatedIds;
  }
}

module.exports = DuplicatedIdentityPublicKeyIdError;
