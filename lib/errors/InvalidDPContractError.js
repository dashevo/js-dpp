const ConsensusError = require('./ConsensusError');

class InvalidDPContractError extends ConsensusError {
  /**
   * @param {Contract} dpContract
   * @param {Object} rawSTPacket
   */
  constructor(dpContract, rawSTPacket) {
    super('Invalid Contract for ST Packet validation');

    this.dpContract = dpContract;
    this.rawSTPacket = rawSTPacket;
  }

  /**
   * Get contract ID
   *
   * @return {Contract}
   */
  getDPContract() {
    return this.dpContract;
  }

  /**
   * Get raw ST Packet
   *
   * @return {Object}
   */
  getRawSTPacket() {
    return this.rawSTPacket;
  }
}

module.exports = InvalidDPContractError;
