const IdentityStateTransition = require('./IdentityCreateTransition');

const identityCreateTransitionSchema = require('../../../../schema/identity/state-transitions/identity-create');
const publicKeySchema = require('../../../../schema/identity/public-key');

/**
 * @param {JsonSchemaValidator} validator
 * @param {validateIdentityType} validateIdentityType
 * @param {validatePublicKeys} validatePublicKeys
 * @return {validateIdentityCreateST}
 */
function validateIdentityCreateSTStructureFactory(
  validator,
  validateIdentityType,
  validatePublicKeys,
) {
  /**
   * @typedef validateIdentityCreateST
   * @param {IdentityCreateTransition} identityStateTransition
   * @return {ValidationResult}
   */
  function validateIdentityCreateST(identityStateTransition) {
    let rawIdentityStateTransition;

    if (identityStateTransition instanceof IdentityStateTransition) {
      rawIdentityStateTransition = identityStateTransition.toJSON();
    } else {
      rawIdentityStateTransition = identityStateTransition;
    }

    const additionalSchemas = {
      [publicKeySchema.$id]: publicKeySchema,
    };

    const result = validator.validate(
      identityCreateTransitionSchema,
      rawIdentityStateTransition,
      additionalSchemas,
    );

    if (!result.isValid()) {
      return result;
    }

    result.merge(
      validateIdentityType(rawIdentityStateTransition.identityType),
    );

    result.merge(
      validatePublicKeys(rawIdentityStateTransition.publicKeys),
    );

    return result;
  }

  return validateIdentityCreateST;
}

module.exports = validateIdentityCreateSTStructureFactory;
