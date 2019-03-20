/**
 * @param {validateContract} validateContract
 * @return {validateSTPacketContracts}
 */
function validateSTPacketContractsFactory(validateContract) {
  /**
   * @typedef validateSTPacketContracts
   * @param {Object} rawSTPacket
   * @return {ValidationResult}
   */
  function validateSTPacketContracts(rawSTPacket) {
    const { contracts: [rawDPContract] } = rawSTPacket;

    return validateContract(rawDPContract);
  }

  return validateSTPacketContracts;
}

module.exports = validateSTPacketContractsFactory;
