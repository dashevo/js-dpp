/**
 * @param {validateDataContract} validateDataContract
 * @return {validateDataContractSTStructure}
 */
function validateDataContractSTStructureFactory(validateDataContract) {
  /**
   * @typedef validateDataContractSTStructure
   * @param {DataContractStateTransition} dataContractStateTransition
   * @return {ValidationResult}
   */
  function validateDataContractSTStructure(dataContractStateTransition) {
    return validateDataContract(dataContractStateTransition.getDataContract());
  }

  return validateDataContractSTStructure;
}

module.exports = validateDataContractSTStructureFactory;
