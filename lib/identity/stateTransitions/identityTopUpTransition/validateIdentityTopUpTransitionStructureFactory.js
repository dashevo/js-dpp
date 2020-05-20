const ValidationResult = require('../../../validation/ValidationResult');

/**
 * @return {validateIdentityTopUpTransition}
 */
function validateIdentityTopUpTransitionStructureFactory() {
  /**
   * @typedef validateIdentityTopUpTransition
   * @return {ValidationResult}
   */
  function validateIdentityTopUpTransition() {
    return new ValidationResult();
  }

  return validateIdentityTopUpTransition;
}

module.exports = validateIdentityTopUpTransitionStructureFactory;
