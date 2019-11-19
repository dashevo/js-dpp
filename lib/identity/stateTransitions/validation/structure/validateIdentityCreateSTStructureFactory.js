const IdentityStateTransition = require('./../../IdentityCreateStateTransition');

const identityCreateStateTransitionSchema = require('../../../../../schema/identity/state-transitions/identity-create');
const publicKeySchema = require('../../../../../schema/identity/public-key');

const ValidationResult = require('../../../../validation/ValidationResult');

/**
 * @param {JsonSchemaValidator} validator
 * @return {validateIdentityCreateST}
 */
function validateIdentityCreateSTStructureFactory(validator) {
  /**
   * @typedef validateIdentityCreateST
   * @param {IdentityCreateStateTransition} identityStateTransition
   * @return {ValidationResult}
   */
  function validateIdentityCreateST(identityStateTransition) {
    const result = new ValidationResult();

    let rawIdentityStateTransition;

    if (identityStateTransition instanceof IdentityStateTransition) {
      rawIdentityStateTransition = identityStateTransition.toJSON();
    } else {
      rawIdentityStateTransition = identityStateTransition;
    }

    const additionalSchemas = {
      [publicKeySchema.$id]: publicKeySchema,
    };

    const schemaValidationResult = validator.validate(
      identityCreateStateTransitionSchema,
      rawIdentityStateTransition,
      additionalSchemas,
    );

    result.merge(schemaValidationResult);

    return result;
  }

  return validateIdentityCreateST;
}

module.exports = validateIdentityCreateSTStructureFactory;
