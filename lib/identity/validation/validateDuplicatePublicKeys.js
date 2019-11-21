const ValidationResult = require('../../validation/ValidationResult');

const DuplicatedIdentityPublicKeyError = require('../../errors/DuplicatedIdentityPublicKeyError');
const DuplicatedIdentityPublicKeyIdError = require('../../errors/DuplicatedIdentityPublicKeyIdError');

/**
 * @typedef validateDuplicatePublicKeys
 * @param {RawIdentityPublicKey[]} publicKeys
 * @return {ValidationResult}
 */
function validateDuplicatePublicKeys(publicKeys) {
  const result = new ValidationResult();

  // Check that there's no duplicated key ids in the state transition
  const duplicatedIds = [];
  const idsCount = {};

  publicKeys.forEach((publicKey) => {
    idsCount[publicKey.id] = !idsCount[publicKey.id] ? 1 : idsCount[publicKey.id] + 1;
    if (idsCount[publicKey.id] > 1) {
      duplicatedIds.push(publicKey.id);
    }
  });

  if (duplicatedIds.length > 0) {
    result.addError(new DuplicatedIdentityPublicKeyIdError(publicKeys));
  }

  // Check that there's no duplicated keys
  const keysCount = {};
  const duplicatedKeys = [];
  publicKeys.forEach((publicKey) => {
    keysCount[publicKey.data] = !keysCount[publicKey.data]
      ? 1 : keysCount[publicKey.data] + 1;
    if (keysCount[publicKey.data] > 1) {
      duplicatedKeys.push(publicKey.data);
    }
  });

  if (duplicatedKeys.length > 0) {
    result.addError(new DuplicatedIdentityPublicKeyError(publicKeys));
  }

  return result;
}

module.exports = validateDuplicatePublicKeys;
