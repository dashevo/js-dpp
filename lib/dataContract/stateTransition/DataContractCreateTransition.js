const AbstractStateTransitionIdentitySigned = require('../../stateTransition/AbstractStateTransitionIdentitySigned');
const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');
const DataContract = require('../DataContract');

class DataContractCreateTransition extends AbstractStateTransitionIdentitySigned {
  /**
   * @param {RawDataContractCreateTransition} rawDataContractCreateTransition
   */
  constructor(rawDataContractCreateTransition) {
    super(rawDataContractCreateTransition);

    const dataContract = new DataContract(rawDataContractCreateTransition.dataContract);

    this.setDataContract(dataContract);

    this.entropy = rawDataContractCreateTransition.entropy;
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
   * Get system properties
   *
   * @protected
   *
   * @param {Object} [options]
   * @param {boolean} [options.skipSignature]
   * @param {boolean} [options.asJSON]
   *
   * @return {Object}
   */
  getSystemProperties(options = {}) {
    return {
      ...super.getSystemProperties(options),
      dataContract: this.getDataContract().toJSON(),
      entropy: this.entropy,
    };
  }

  /**
   * Get owner ID
   * @return {string}
   */
  getOwnerId() {
    return this.getDataContract().getOwnerId();
  }
}

/**
 * @typedef {Object} RawDataContractCreateTransition
 * @property {number} protocolVersion
 * @property {number} type
 * @property {RawDataContract} dataContract
 * @property {number|null} signaturePublicKeyId
 * @property {string|null} signature
 * @property {string|null} entropy
 */

module.exports = DataContractCreateTransition;
