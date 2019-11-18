const identitySchema = require('../../../../schema/model/identity');
const { MAX_RESERVED_IDENTITY_TYPE, IDENTITY_TYPES_ENUM } = require('../../constants');

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
    const isReservedType = identityType < MAX_RESERVED_IDENTITY_TYPE;
    const isRegisteredType = IDENTITY_TYPES_ENUM.includes(identityType);

    /* Check that identity type in the range that is reserved for internal usage,
    /* but is unknown for dpp */
    if (isReservedType && !isRegisteredType) {
      result.addError(new IncorrectIdentityTypeError(identity));
    }
  }

  return validateIdentity;
};
