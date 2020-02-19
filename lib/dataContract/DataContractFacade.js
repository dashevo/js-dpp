const DataContractFactory = require('./DataContractFactory');
const validateDataContractFactory = require('./validateDataContractFactory');
const createDataContract = require('./createDataContract');

class DataContractFacade {
  /**
   * @param {JsonSchemaValidator} jsonSchemaValidator
    * @param {validateDataContractMaxDepth} validateDataContractMaxDepth
   */
  constructor(jsonSchemaValidator, validateDataContractMaxDepth) {
    this.validateDataContract = validateDataContractFactory(
      jsonSchemaValidator,
      validateDataContractMaxDepth,
    );

    this.factory = new DataContractFactory(
      createDataContract,
      this.validateDataContract,
    );
  }

  /**
   * Create Data Contract
   *
   * @param {string} contractId
   * @param {Object} documents
   * @return {DataContract}
   */
  create(contractId, documents) {
    return this.factory.create(contractId, documents);
  }

  /**
   * Create Data Contract from plain object
   *
   * @param {RawDataContract} rawDataContract
   * @param {Object} options
   * @param {boolean} [options.skipValidation=false]
   * @return {Promise<DataContract>}
   */
  async createFromObject(rawDataContract, options = { }) {
    return this.factory.createFromObject(rawDataContract, options);
  }

  /**
   * Create Data Contract from string/buffer
   *
   * @param {Buffer|string} payload
   * @param {Object} options
   * @param {boolean} [options.skipValidation=false]
   * @return {Promise<DataContract>}
   */
  async createFromSerialized(payload, options = { }) {
    return this.factory.createFromSerialized(payload, options);
  }

  /**
   * Create Data Contract State Transition
   *
   * @param {DataContract} dataContract
   * @return {DataContractStateTransition}
   */
  createStateTransition(dataContract) {
    return this.factory.createStateTransition(dataContract);
  }

  /**
   * Validate Data Contract
   *
   * @param {DataContract|RawDataContract} dataContract
   * @return {Promise<ValidationResult>}
   */
  async validate(dataContract) {
    return this.validateDataContract(dataContract);
  }
}

module.exports = DataContractFacade;
