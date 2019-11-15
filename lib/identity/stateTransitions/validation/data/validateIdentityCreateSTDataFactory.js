const IdentityCreateStateTransition = require('../../IdentityCreateStateTransition');

const ValidationResult = require('../../../../validation/ValidationResult');

const IdentitySTWrongVersionError = require('../../../errors/IdentitySTWrongVersionError');

function validateIdentityCreateSTDataFactory() {
  /**
   * Okay so what sort of checks we need to do here
   *
   * + 1. Check that the version isn't higher than current version
   * 2. Check that type either in registered identity types or higher than reserved number
   * 4. Check that public key id isn't duplicated
   * 5. Check that public keys aren't duplicated
   * 4. Check that key id is incremental
   * 7. Verify that lockedOutPoint wasn't used twice
   * 6. Verify ownership proof signature
   *
   * For later versions:
   * 1. We need to check that outpoint exists (not now)
   */

  /**
   * @typedef validateIdentityCreateSTData
   * @param {IdentityCreateStateTransition} identityCreateStateTransition
   * @return {ValidationResult}
   */
  function validateIdentityCreateSTData(identityCreateStateTransition) {
    const result = new ValidationResult();

    const stVersion = identityCreateStateTransition.getIdentityStateTransitionVersion();

    if (stVersion > IdentityCreateStateTransition.getCurrentIdentityCreateSTVersion()) {
      result.addError(
        new IdentitySTWrongVersionError(
          identityCreateStateTransition,
          IdentityCreateStateTransition.getCurrentIdentityCreateSTVersion(),
        ),
      );
    }

    return result;
  }

  return validateIdentityCreateSTData;
}

module.exports = validateIdentityCreateSTDataFactory;
