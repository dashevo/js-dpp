const { PublicKey } = require('@dashevo/dashcore-lib');

const ValidationResult = require('../../../validation/ValidationResult');

const Identity = require('../../../identity/Identity');

const DataContractAlreadyPresentError = require('../../../errors/DataContractAlreadyPresentError');
const InvalidStateTransitionSignatureError = require('../../../errors/InvalidStateTransitionSignatureError');

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
    const userId = stateTransition.getUserId();
    const identity = await dataProvider.fetchIdentity(userId);
    const { publicKey } = identity.getPublicKeyById(stateTransition.getPublicKeyId());
    // eslint-disable-next-line no-underscore-dangle
    const publicKeyHash = new PublicKey(Buffer.from(publicKey, 'base64'))._getID();
    const signatureIsValid = stateTransition.verifySignature(publicKeyHash);

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
