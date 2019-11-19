const ValidationResult = require('../../../validation/ValidationResult');

const Identity = require('../../../identity/model/Identity');

const DataContractAlreadyPresentError = require('../../../errors/DataContractAlreadyPresentError');

/**
 *
 * @param {DataProvider} dataProvider
 * @param {validateIdentityType} validateIdentityType
 * @return {validateDataContractSTData}
 */
function validateDataContractSTDataFactory(dataProvider, validateIdentityType) {
  /**
   * @typedef validateDataContractSTData
   * @param {DataContractStateTransition} stateTransition
   * @return {ValidationResult}
   */
  async function validateDataContractSTData(stateTransition) {
    const result = new ValidationResult();

    // @TODO validate ST signature, when we can get publicKeyId from identity

    const dataContract = stateTransition.getDataContract();
    const dataContractId = dataContract.getId();

    // Data Contract identity must exists and confirmed
    result.merge(
      await validateIdentityType(dataContractId, [Identity.TYPES.APPLICATION]),
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

    return result;
  }

  return validateDataContractSTData;
}

module.exports = validateDataContractSTDataFactory;
