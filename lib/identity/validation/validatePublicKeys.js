const { PublicKey } = require('@dashevo/dashcore-lib');

const IdentityPublicKey = require('../IdentityPublicKey');

const ValidationResult = require('../../validation/ValidationResult');

const InvalidIdentityPublicKeyTypeError = require(
  '../../errors/InvalidIdentityPublicKeyTypeError',
);
const InvalidIdentityPublicKeyDataError = require(
  '../../errors/InvalidIdentityPublicKeyDataError',
);

/**
 * Validate public keys type and data
 *
 * @typedef validatePublicKeys
 *
 * @param {IdentityPublicKey[]|RawIdentityPublicKey[]} publicKeys
 *
 * @return {ValidationResult}
 */
function validatePublicKeys(publicKeys) {
  const result = new ValidationResult();

  publicKeys
    .map((publicKey) => {
      if (publicKey instanceof IdentityPublicKey) {
        return publicKey;
      }

      return new IdentityPublicKey(publicKey);
    })
    .forEach((publicKey) => {
      if (publicKey.getType() !== IdentityPublicKey.TYPES.ECDSA_SECP256K1) {
        result.addError(
          new InvalidIdentityPublicKeyTypeError(publicKey.getType()),
        );
      }

      if (!PublicKey.isValid(publicKey.getData())) {
        result.addError(
          new InvalidIdentityPublicKeyDataError(
            publicKey,
            PublicKey.getValidationError(publicKey.getData()),
          ),
        );
      }
    });

  return result;
}

module.exports = validatePublicKeys;
