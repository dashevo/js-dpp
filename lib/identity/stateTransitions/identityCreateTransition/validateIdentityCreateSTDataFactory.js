const Identity = require('../../Identity');

const ValidationResult = require('../../../validation/ValidationResult');

const UnknownIdentityTypeError = require('../../../errors/UnknownIdentityTypeError');
const DuplicatedIdentitySTPublicKeyError = require('../../../errors/DuplicatedIdentitySTPublicKeyError');
const DuplicatedIdentitySTPublicKeyIdError = require('../../../errors/DuplicatedIdentitySTPublicKeyIdError');
const IdentityAlreadyExistsError = require('../../../errors/IdentityAlreadyExistsError');

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
    idsCount[publicKey.id] = !idsCount[publicKey.id] ? 1 : idsCount[publicKey.id] + 1;
    if (idsCount[publicKey.id] > 1) {
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

/**
 * @param {DataProvider} dataProvider
 * @return {validateIdentityCreateSTData}
 */
function validateIdentityCreateSTDataFactory(dataProvider) {
  /**
   *
   * Do we need to check that key ids are incremental?
   *
   * For later versions:
   * 1. We need to check that outpoint exists (not now)
   * 2. Verify ownership proof signature, as it requires special transaction to be implemented
   */

  /**
   * @typedef validateIdentityCreateSTData
   * @param {IdentityCreateTransition} identityCreateTransition
   * @return {ValidationResult}
   */
  async function validateIdentityCreateSTData(identityCreateTransition) {
    const result = new ValidationResult();

    const identityType = identityCreateTransition.getIdentityType();
    const isReservedType = identityType < Identity.MAX_RESERVED_TYPE;
    const isRegisteredType = Identity.TYPES_ENUM.includes(identityType);

    /* Check that identity type in the range that is reserved for internal usage,
    /* but is unknown for dpp */
    if (isReservedType && !isRegisteredType) {
      result.addError(new UnknownIdentityTypeError(identityCreateTransition));
    }

    // Check that there's no duplicated keys or duplicated key ids in the state transition
    const {
      duplicatedKeys, duplicatedIds,
    } = findDuplicatedKeysOrIds(identityCreateTransition.getPublicKeys());

    if (duplicatedKeys.length > 0) {
      result.addError(new DuplicatedIdentitySTPublicKeyError(identityCreateTransition));
    }

    if (duplicatedIds.length > 0) {
      result.addError(new DuplicatedIdentitySTPublicKeyIdError(identityCreateTransition));
    }

    // Check if identity with such id already exists
    const identityId = identityCreateTransition.getIdentityId();
    const identity = await dataProvider.fetchIdentity(identityId);

    if (identity) {
      result.addError(new IdentityAlreadyExistsError(identityCreateTransition));
    }

    // TODO: Here we need to fetch lock transaction, extract pubkey from it and verify signature

    return result;
  }

  return validateIdentityCreateSTData;
}

module.exports = validateIdentityCreateSTDataFactory;
