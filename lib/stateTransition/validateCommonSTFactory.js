/**
 * @param {validateDataContract} validateDataContract
 * @return {validateDataContractST}
 */
function validateCommonSTFactory(validateDataContract) {
  /**
   * @typedef validateDataContractST
   * @param {DataContractStateTransition} dataContractStateTransition
   * @return {ValidationResult}
   */
  function validateSTPacketContracts(dataContractStateTransition) {
    return validateDataContract(dataContractStateTransition.getDataContract());
  }

  return validateSTPacketContracts;
}

module.exports = validateCommonSTFactory;
