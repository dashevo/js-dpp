const ValidationResult = require('../../validation/ValidationResult');
const UnexpectedIdentityTypeError = require('../../errors/UnexpectedIdentityTypeError');
const IdentityNotFoundError = require('../../errors/IdentityNotFoundError');

/**
 * @param {DataProvider} dataProvider
 * @return {checkIdentity}
 */
function checkIdentityFactory(dataProvider) {
  /**
   * @typedef checkIdentity
   * @param {string} identityId
   * @param {number} expectedIdentityType
   * @return {Promise<ValidationResult>}
   */
  async function checkIdentity(identityId, expectedIdentityType) {
    const result = new ValidationResult();

    const rawIdentity = await dataProvider.fetchIdentity(identityId);

    if (!rawIdentity) {
      result.addError(new IdentityNotFoundError(identityId));
    }

    if (rawIdentity.identityType !== expectedIdentityType) {
      result.addError(new UnexpectedIdentityTypeError(rawIdentity, expectedIdentityType));
    }

    return result;
  }

  return checkIdentity;
}

module.exports = checkIdentityFactory;
