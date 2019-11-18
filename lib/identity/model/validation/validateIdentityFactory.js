const identitySchema = require('../../../../schema/model/identity');
const Identity = require('../../model/Identity');

const IncorrectIdentityTypeError = require('../../../errors/IncorrectIdentityTypeError');

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
    const result = validator.validate(identitySchema, identity);

    const { identityType } = identity;
    const isReservedType = identityType < Identity.MAX_RESERVED_TYPE;
    const isRegisteredType = Identity.TYPES_ENUM.includes(identityType);

    /* Check that identity type in the range that is reserved for internal usage,
    /* but is unknown for dpp */
    if (isReservedType && !isRegisteredType) {
      result.addError(new IncorrectIdentityTypeError(identity));
    }
  }

  return validateIdentity;
};
