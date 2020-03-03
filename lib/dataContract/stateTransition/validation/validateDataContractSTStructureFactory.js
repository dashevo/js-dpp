const ValidationResult = require('../../../validation/ValidationResult');
const DataContractStateTransition = require('../DataContractStateTransition');

/**
 * @param {validateDataContract} validateDataContract
 * @param {validateStateTransitionSignature} validateStateTransitionSignature
 * @param {createDataContract} createDataContract
 * @param {validateIdentityExistence} validateIdentityExistence
 * @return {validateDataContractSTStructure}
 */
function validateDataContractSTStructureFactory(
  validateDataContract,
  validateStateTransitionSignature,
  createDataContract,
  validateIdentityExistence,
) {
  /**
   * @typedef validateDataContractSTStructure
   * @param {RawDataContractStateTransition} rawStateTransition
   * @return {ValidationResult}
   */
  async function validateDataContractSTStructure(rawStateTransition) {
    const result = new ValidationResult();

    result.merge(
      await validateDataContract(rawStateTransition.dataContract),
    );

    if (!result.isValid()) {
      return result;
    }

    const dataContract = createDataContract(rawStateTransition.dataContract);
    const dataContractId = dataContract.getId();

    // Data Contract identity must exists and confirmed
    result.merge(
      await validateIdentityExistence(dataContractId),
    );

    if (!result.isValid()) {
      return result;
    }

    // Verify ST signature
    const stateTransition = new DataContractStateTransition(dataContract);

    stateTransition
      .setSignature(rawStateTransition.signature)
      .setSignaturePublicKeyId(rawStateTransition.signaturePublicKeyId);

    result.merge(
      await validateStateTransitionSignature(stateTransition, dataContractId),
    );

    return result;
  }

  return validateDataContractSTStructure;
}

module.exports = validateDataContractSTStructureFactory;
