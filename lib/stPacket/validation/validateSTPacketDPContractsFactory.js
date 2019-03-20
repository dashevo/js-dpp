/**
 * @param {validateContract} validateContract
 * @return {validateSTPacketDPContracts}
 */
function validateSTPacketDPContractsFactory(validateContract) {
  /**
   * @typedef validateSTPacketDPContracts
   * @param {Object} rawSTPacket
   * @return {ValidationResult}
   */
  function validateSTPacketDPContracts(rawSTPacket) {
    const { contracts: [rawDPContract] } = rawSTPacket;

    return validateContract(rawDPContract);
  }

  return validateSTPacketDPContracts;
}

module.exports = validateSTPacketDPContractsFactory;
