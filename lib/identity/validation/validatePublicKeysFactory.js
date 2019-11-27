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
 * Validate public keys (factory)
 *
 * @param {validateDuplicatePublicKeys} validateDuplicatePublicKeys
 *
 * @return {validatePublicKeys}
 */
function validatePublicKeysFactory(validateDuplicatePublicKeys) {
  /**
   * Validate public keys type and data and duplication
   *
   * @typedef validatePublicKeys
   *
   * @param {IdentityPublicKey[]|RawIdentityPublicKey[]} publicKeys
   *
   * @return {ValidationResult}
   */
  function validatePublicKeys(publicKeys) {
    const result = new ValidationResult();

    const rawPublicKeys = publicKeys
      .map((publicKey) => {
        if (publicKey instanceof IdentityPublicKey) {
          return publicKey.toJSON();
        }

        return publicKey;
      });

    // validate duplication
    result.merge(
      validateDuplicatePublicKeys(rawPublicKeys),
    );

    // validate type and data
    rawPublicKeys
      .forEach((publicKey) => {
        if (publicKey.type !== IdentityPublicKey.TYPES.ECDSA_SECP256K1) {
          result.addError(
            new InvalidIdentityPublicKeyTypeError(publicKey.type),
          );
        }

        if (!PublicKey.isValid(publicKey.data)) {
          result.addError(
            new InvalidIdentityPublicKeyDataError(
              publicKey,
              PublicKey.getValidationError(publicKey.data),
            ),
          );
        }
      });

    return result;
  }

  return validatePublicKeys;
}

module.exports = validatePublicKeysFactory;
