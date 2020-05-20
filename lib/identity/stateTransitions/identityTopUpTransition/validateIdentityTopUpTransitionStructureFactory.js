const ValidationResult = require('../../../validation/ValidationResult');
const IdentityStateTransition = require('./IdentityTopUpTransition');

/**
 * @return {validateIdentityTopUpST}
 */
function validateIdentityTopUpTransitionStructureFactory() {
  /**
   * @typedef validateIdentityTopUpST
   * @param {IdentityTopUpTransition} identityStateTransition
   * @return {ValidationResult}
   */
  function validateIdentityTopUpST(identityStateTransition) {
    let rawIdentityStateTransition;

    if (identityStateTransition instanceof IdentityStateTransition) {
      rawIdentityStateTransition = identityStateTransition.toJSON();
    } else {
      rawIdentityStateTransition = identityStateTransition;
    }

    const result = new ValidationResult();

    return result;
  }

  return validateIdentityTopUpST;
}

module.exports = validateIdentityTopUpTransitionStructureFactory;
