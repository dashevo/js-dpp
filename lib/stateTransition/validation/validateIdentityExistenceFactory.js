const ValidationResult = require('../../validation/ValidationResult');
const IdentityNotFoundError = require('../../errors/IdentityNotFoundError');

/**
 * @param {DataProvider} dataProvider
 * @return {validateIdentityExistence}
 */
function validateIdentityExistenceFactory(dataProvider) {
  /**
   * @typedef validateIdentityExistence
   * @param {string} identityId
   * @return {Promise<ValidationResult>}
   */
  async function validateIdentityExistence(identityId) {
    const result = new ValidationResult();

    const rawIdentity = await dataProvider.fetchIdentity(identityId);

    if (!rawIdentity) {
      result.addError(new IdentityNotFoundError(identityId));
      return result;
    }

    return result;
  }

  return validateIdentityExistence;
}

module.exports = validateIdentityExistenceFactory;
