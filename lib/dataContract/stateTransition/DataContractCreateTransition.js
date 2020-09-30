const AbstractStateTransitionIdentitySigned = require('../../stateTransition/AbstractStateTransitionIdentitySigned');
const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');
const DataContract = require('../DataContract');
const EncodedBuffer = require('../../util/encoding/EncodedBuffer');

class DataContractCreateTransition extends AbstractStateTransitionIdentitySigned {
  /**
   * @param {RawDataContractCreateTransition} rawDataContractCreateTransition
   */
  constructor(rawDataContractCreateTransition) {
    super(rawDataContractCreateTransition);

    const dataContract = new DataContract(rawDataContractCreateTransition.dataContract);

    this.setDataContract(dataContract);

    this.entropy = EncodedBuffer.from(
      rawDataContractCreateTransition.entropy,
      EncodedBuffer.ENCODING.BASE58,
    );
  }

  /**
   * Get State Transition type
   *
   * @return {number}
   */
  getType() {
    return stateTransitionTypes.DATA_CONTRACT_CREATE;
  }

  /**
   * Get Data Contract
   *
   * @return {DataContract}
   */
  getDataContract() {
    return this.dataContract;
  }

  /**
   * Set Data Contract
   *
   * @param {DataContract} dataContract
   * @return {DataContractCreateTransition}
   */
  setDataContract(dataContract) {
    this.dataContract = dataContract;

    return this;
  }

  /**
   * Get entropy
   *
   * @returns {EncodedBuffer}
   */
  getEntropy() {
    return this.entropy;
  }

  /**
   * Get state transition as plain object
   *
   * @param {Object} [options]
   * @param {boolean} [options.skipSignature]
   * @param {boolean} [options.encodedBuffer=false]
   * @return {Object}
   */
  toObject(options = {}) {
    Object.assign(
      options,
      {
        encodedBuffer: false,
        ...options,
      },
    );

    let plainObject = {
      ...super.toObject(options),
      dataContract: this.getDataContract().toObject(),
      entropy: this.entropy,
    };

    if (!options.encodedBuffer) {
      plainObject = {
        ...plainObject,
        entropy: plainObject.entropy.toBuffer(),
      };
    }

    return plainObject;
  }

  /**
   * Get state transition as JSON
   *
   * @param {Object} [options]
   *
   * @return {Object}
   */
  toJSON(options = {}) {
    const json = super.toJSON(options);

    return {
      ...json,
      entropy: json.entropy.toString(),
      dataContract: this.getDataContract().toJSON(),
    };
  }

  /**
   * Get owner ID
   * @return {EncodedBuffer}
   */
  getOwnerId() {
    return this.getDataContract().getOwnerId();
  }

  /**
   * Create state transition from JSON
   *
   * @param {RawDataContractCreateTransition} rawStateTransition
   *
   * @return {DataContractCreateTransition}
   */
  static fromJSON(rawStateTransition) {
    return new DataContractCreateTransition(
      AbstractStateTransitionIdentitySigned.translateJsonToObject(rawStateTransition),
    );
  }
}

/**
 * @typedef {Object} RawDataContractCreateTransition
 * @property {number} protocolVersion
 * @property {number} type
 * @property {RawDataContract} dataContract
 * @property {number|null} signaturePublicKeyId
 * @property {Buffer|null} signature
 * @property {string|null} entropy
 */

module.exports = DataContractCreateTransition;
