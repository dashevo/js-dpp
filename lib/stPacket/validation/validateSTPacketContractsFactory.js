/**
 * @param {validateDataContract} validateContract
 * @return {validateSTPacketContracts}
 */
function validateSTPacketContractsFactory(validateContract) {
  /**
   * @typedef validateSTPacketContracts
   * @param {RawSTPacket} rawSTPacket
   * @return {ValidationResult}
   */
  function validateSTPacketContracts(rawSTPacket) {
    const { contracts: [rawDataContract] } = rawSTPacket;

    return validateContract(rawDataContract);
  }

  return validateSTPacketContracts;
}

module.exports = validateSTPacketContractsFactory;
