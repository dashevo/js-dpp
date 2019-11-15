const IdentityCreateStateTransition = require('../../IdentityCreateStateTransition');
const { MAX_RESERVED_IDENTITY_TYPE, IDENTITY_TYPES_ENUM } = require('../../../constants');

const ValidationResult = require('../../../../validation/ValidationResult');

const IdentitySTWrongVersionError = require('../../../../errors/IdentitySTWrongVersionError');
const UnknownIdentityTypeError = require('../../../../errors/UnknownIdentityTypeError');
const DuplicatedIdentitySTPublicKeyError = require('../../../../errors/DuplicatedIdentitySTPublicKeyError');
const DuplicatedIdentitySTPublicKeyIdError = require('../../../../errors/DuplicatedIdentitySTPublicKeyIdError');

/**
 *
 * @param {RawPublicKey[]} publicKeys
 * @return {{duplicatedIds: [], duplicatedKeys: []}}
 */
function findDuplicatedKeysOrIds(publicKeys) {
  const keysCount = {};
  const idsCount = {};
  const duplicatedKeys = [];
  const duplicatedIds = [];

  publicKeys.forEach((publicKey) => {
    idsCount[publicKey.id] = !keysCount[publicKey.id] ? 1 : idsCount[publicKey.id] + 1;
    if (idsCount > 1) {
      duplicatedIds.push(publicKey.id);
    }

    keysCount[publicKey.publicKey] = !keysCount[publicKey.publicKey]
      ? 1 : keysCount[publicKey.publicKey] + 1;
    if (keysCount[publicKey.publicKey] > 1) {
      duplicatedKeys.push(publicKey.publicKey);
    }
  });

  return { duplicatedIds, duplicatedKeys };
}

function validateIdentityCreateSTDataFactory() {
  /**
   * Okay so what sort of checks we need to do here
   *
   * + 1. Check that the version isn't higher than current version
   * + 2. Check that type either in registered identity types or higher than reserved number
   * + 4. Check that public key id isn't duplicated
   * + 5. Check that public keys aren't duplicated
   * 4. Check that key ids are incremental
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

    // Check that the identity st version isn't higher than the current version
    if (stVersion > IdentityCreateStateTransition.getCurrentIdentityCreateSTVersion()) {
      result.addError(
        new IdentitySTWrongVersionError(
          identityCreateStateTransition,
          IdentityCreateStateTransition.getCurrentIdentityCreateSTVersion(),
        ),
      );
    }

    const identityType = identityCreateStateTransition.getType();
    const isReservedType = identityType < MAX_RESERVED_IDENTITY_TYPE;
    const isRegisteredType = !IDENTITY_TYPES_ENUM.includes(identityType);

    /* Check that identity type in the range that is reserved for internal usage,
    /* but is unknown for dpp */
    if (isReservedType && !isRegisteredType) {
      result.addError(new UnknownIdentityTypeError(identityCreateStateTransition));
    }

    // Check that there's no duplicated keys or duplicated key ids in the state transition
    const {
      duplicatedKeys, duplicatedIds,
    } = findDuplicatedKeysOrIds(identityCreateStateTransition.getPublicKeys());

    if (duplicatedKeys.length > 0) {
      result.addError(new DuplicatedIdentitySTPublicKeyError(identityCreateStateTransition));
    }

    if (duplicatedIds.length > 0) {
      result.addError(new DuplicatedIdentitySTPublicKeyIdError(identityCreateStateTransition));
    }

    return result;
  }

  return validateIdentityCreateSTData;
}

module.exports = validateIdentityCreateSTDataFactory;
