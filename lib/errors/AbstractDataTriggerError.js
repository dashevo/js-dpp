const ConsensusError = require('./ConsensusError');
const EncodedBuffer = require('../util/encoding/EncodedBuffer');

/**
 * @abstract
 */
class AbstractDataTriggerError extends ConsensusError {
  /**
   * @param {string} message
   * @param {DataContract} dataContract
   * @param {Buffer} ownerId
   */
  constructor(message, dataContract, ownerId) {
    super(message);

    this.dataContract = dataContract;
    this.ownerId = EncodedBuffer.from(ownerId, EncodedBuffer.ENCODING.BASE58);
  }

  /**
   * Get data trigger data contract
   *
   * @return {DataContract}
   */
  getDataContract() {
    return this.dataContract;
  }

  /**
   * Get data trigger owner id
   *
   * @return {EncodedBuffer}
   */
  getOwnerId() {
    return this.ownerId;
  }
}

module.exports = AbstractDataTriggerError;
