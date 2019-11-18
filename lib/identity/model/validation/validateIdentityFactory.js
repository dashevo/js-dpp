const identitySchema = require('../../../../schema/model/identity');

/**
 * @param {JsonSchemaValidator} validator
 * @return {validateIdentity}
 */
module.exports = function validateIdentityFactory(validator) {
  /**
   * Validates identity
   *
   * @typedef validateIdentity
   * @param {Identity|RawIdentity} identity
   * @return {ValidationResult}
   */
  function validateIdentity(identity) {
    return validator.validate(identitySchema, identity);
  }

  return validateIdentity;
};
