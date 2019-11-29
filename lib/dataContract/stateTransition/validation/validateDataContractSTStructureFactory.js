const ValidationResult = require('../../../validation/ValidationResult');
const DataContractStateTransition = require('../DataContractStateTransition');

/**
 * @param {validateDataContract} validateDataContract
 * @param {validateStateTransitionSignature} validateStateTransitionSignature
 * @param {createDataContract} createDataContract
 * @return {validateDataContractSTStructure}
 */
function validateDataContractSTStructureFactory(
  validateDataContract,
  validateStateTransitionSignature,
  createDataContract,
) {
  /**
   * @typedef validateDataContractSTStructure
   * @param {RawDataContractStateTransition} rawStateTransition
   * @return {ValidationResult}
   */
  async function validateDataContractSTStructure(rawStateTransition) {
    const result = new ValidationResult();

    result.merge(
      validateDataContract(rawStateTransition.dataContract),
    );

    // Verify ST signature
    const dataContract = createDataContract(rawStateTransition.dataContract);
    const stateTransition = new DataContractStateTransition(dataContract);

    stateTransition
      .setSignature(rawStateTransition.signature)
      .setSignaturePublicKeyId(rawStateTransition.signaturePublicKeyId);

    const dataContractId = dataContract.getId();

    result.merge(
      await validateStateTransitionSignature(stateTransition, dataContractId),
    );

    return result;
  }

  return validateDataContractSTStructure;
}

module.exports = validateDataContractSTStructureFactory;
