const ValidationResult = require('../../../../validation/ValidationResult');

/**
 * @param validator
 * @return {validateIdentityCreateST}
 */
function validateIdentityCreateSTStructureFactory(validator) {
  /**
   * @typedef validateIdentityCreateST
   * @param identityStateTransition
   * @param options
   * @return {ValidationResult}
   */
  function validateIdentityCreateST(identityStateTransition, options = {}) {
    const result = new ValidationResult();

    return result;
  }

  return validateIdentityCreateST;
}

module.exports = validateIdentityCreateSTStructureFactory;
