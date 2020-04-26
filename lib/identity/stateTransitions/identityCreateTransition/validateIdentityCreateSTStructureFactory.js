const IdentityStateTransition = require('./IdentityCreateTransition');

const identityCreateTransitionSchema = require('../../../../schema/identity/stateTransition/identityCreate.json');

/**
 * @param {JsonSchemaValidator} validator
 * @param {validatePublicKeys} validatePublicKeys
 * @return {validateIdentityCreateST}
 */
function validateIdentityCreateSTStructureFactory(
  validator,
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

    const result = validator.validate(
      identityCreateTransitionSchema,
      rawIdentityStateTransition,
    );

    if (!result.isValid()) {
      return result;
    }

    result.merge(
      validatePublicKeys(rawIdentityStateTransition.publicKeys),
    );

    return result;
  }

  return validateIdentityCreateST;
}

module.exports = validateIdentityCreateSTStructureFactory;
