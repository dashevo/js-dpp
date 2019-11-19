const ValidationResult = require('../../validation/ValidationResult');
const UnexpectedIdentityTypeError = require('../../errors/UnexpectedIdentityTypeError');
const IdentityNotFoundError = require('../../errors/IdentityNotFoundError');

/**
 * @param {DataProvider} dataProvider
 * @return {validateIdentityType}
 */
function validateIdentityTypeFactory(dataProvider) {
  /**
   * @typedef validateIdentityType
   * @param {string} identityId
   * @param {number[]} expectedIdentityTypes
   * @return {Promise<ValidationResult>}
   */
  async function validateIdentityType(identityId, expectedIdentityTypes) {
    const result = new ValidationResult();

    const rawIdentity = await dataProvider.fetchIdentity(identityId);

    if (!rawIdentity) {
      result.addError(new IdentityNotFoundError(identityId));
      return result;
    }

    if (!expectedIdentityTypes.includes(rawIdentity.type)) {
      result.addError(new UnexpectedIdentityTypeError(rawIdentity, expectedIdentityTypes));
    }

    return result;
  }

  return validateIdentityType;
}

module.exports = validateIdentityTypeFactory;
