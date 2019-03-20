const Ajv = require('ajv');

const JsonSchemaValidator = require('./validation/JsonSchemaValidator');

const ContractFacade = require('./contract/ContractFacade');
const DocumentFacade = require('./document/DocumentFacade');
const STPacketFacade = require('./stPacket/STPacketFacade');
const STPacketHeaderFacade = require('./stPacketHeader/STPacketHeaderFacade');

/**
 * @class DashPlatformProtocol
 */
class DashPlatformProtocol {
  /**
   * @param {string} [options.userId]
   * @param {Contract} [options.contract]
   * @param {DataProvider} [options.dataProvider]
   */
  constructor(options = {}) {
    this.userId = options.userId;
    this.innerContract = options.contract;
    this.dataProvider = options.dataProvider;

    const validator = new JsonSchemaValidator(new Ajv());

    this.initializeFacades(validator);
  }

  /**
   * @private
   * @param {JsonSchemaValidator} validator
   */
  initializeFacades(validator) {
    this.contract = new ContractFacade(validator);

    this.document = new DocumentFacade(this, validator);

    this.packet = new STPacketFacade(this, validator);

    this.packetHeader = new STPacketHeaderFacade(validator);
  }

  /**
   * Set User ID
   *
   * @param {string} userId
   * @return {DashPlatformProtocol}
   */
  setUserId(userId) {
    this.userId = userId;

    return this;
  }

  /**
   * Get User ID
   *
   * @return {string}
   */
  getUserId() {
    return this.userId;
  }

  /**
   * Set Contract
   *
   * @param {Contract} contract
   * @return {DashPlatformProtocol}
   */
  setContract(contract) {
    this.innerContract = contract;

    return this;
  }

  /**
   * Get Contract
   *
   * @return {Contract}
   */
  getContract() {
    return this.innerContract;
  }

  /**
   * Set Data Provider
   *
   * @param {DataProvider} dataProvider
   * @return {DashPlatformProtocol}
   */
  setDataProvider(dataProvider) {
    this.dataProvider = dataProvider;

    return this;
  }

  /**
   * Get Data Provider
   *
   * @return {DataProvider}
   */
  getDataProvider() {
    return this.dataProvider;
  }
}

module.exports = DashPlatformProtocol;
