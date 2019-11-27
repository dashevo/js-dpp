const ValidationResult = require('../../../validation/ValidationResult');

const Identity = require('../../../identity/Identity');

const DataContractAlreadyPresentError = require('../../../errors/DataContractAlreadyPresentError');
const InvalidStateTransitionSignatureError = require('../../../errors/InvalidStateTransitionSignatureError');
const InvalidIdentityPublicKeyTypeError = require('../../../errors/InvalidIdentityPublicKeyTypeError');
const SignatureVerificationError = require('../../../errors/SignatureVerificationError');

const IdentityPublicKey = require('../../../identity/IdentityPublicKey');

/**
 *
 * @param {DataProvider} dataProvider
 * @param {validateIdentityExistenceAndType} validateIdentityExistenceAndType
 * @return {validateDataContractSTData}
 */
function validateDataContractSTDataFactory(dataProvider, validateIdentityExistenceAndType) {
  /**
   * @typedef validateDataContractSTData
   * @param {DataContractStateTransition} stateTransition
   * @return {ValidationResult}
   */
  async function validateDataContractSTData(stateTransition) {
    const result = new ValidationResult();

    const dataContract = stateTransition.getDataContract();
    const dataContractId = dataContract.getId();

    // Data Contract identity must exists and confirmed
    result.merge(
      await validateIdentityExistenceAndType(dataContractId, [Identity.TYPES.APPLICATION]),
    );

    if (!result.isValid()) {
      return result;
    }

    // Data contract shouldn't exist
    const existingDataContract = await dataProvider.fetchDataContract(dataContractId);

    if (existingDataContract) {
      result.addError(
        new DataContractAlreadyPresentError(dataContract),
      );
    }

    if (!result.isValid()) {
      return result;
    }

    // Verify ST signature
    const identity = await dataProvider.fetchIdentity(dataContractId);
    const publicKey = identity.getPublicKeyById(stateTransition.getSignaturePublicKeyId());
    if (publicKey.getType() !== IdentityPublicKey.TYPES.ECDSA_SECP256K1) {
      result.addError(
        new InvalidIdentityPublicKeyTypeError(publicKey.getType()),
      );

      return result;
    }

    let signatureIsValid;

    try {
      signatureIsValid = stateTransition.verifySignature(publicKey);
    } catch (e) {
      result.addError(new SignatureVerificationError(stateTransition.getSignature(), e));
    }

    if (!signatureIsValid) {
      result.addError(
        new InvalidStateTransitionSignatureError(stateTransition),
      );
    }

    return result;
  }

  return validateDataContractSTData;
}

module.exports = validateDataContractSTDataFactory;
