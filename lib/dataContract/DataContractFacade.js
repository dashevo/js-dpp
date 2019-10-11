const ContractFactory = require('./DataContractFactory');
const validateContractFactory = require('./validateDataContractFactory');
const createContract = require('./createDataContract');

class DataContractFacade {
  /**
   * @param {JsonSchemaValidator} validator
   */
  constructor(validator) {
    this.validateContract = validateContractFactory(validator);

    this.factory = new ContractFactory(
      createContract,
      this.validateContract,
    );
  }

  /**
   * Create Contract
   *
   * @param {string} contractId
   * @param {Object} documents
   * @return {DataContract}
   */
  create(contractId, documents) {
    return this.factory.create(contractId, documents);
  }

  /**
   * Create Contract from plain object
   *
   * @param {RawDataContract} rawDataContract
   * @param {Object} options
   * @param {boolean} [options.skipValidation=false]
   * @return {DataContract}
   */
  createFromObject(rawDataContract, options = { skipValidation: false }) {
    return this.factory.createFromObject(rawDataContract, options);
  }

  /**
   * Create Contract from string/buffer
   *
   * @param {Buffer|string} payload
   * @param {Object} options
   * @param {boolean} [options.skipValidation=false]
   * @return {DataContract}
   */
  createFromSerialized(payload, options = { skipValidation: false }) {
    return this.factory.createFromSerialized(payload, options);
  }

  /**
   * Validate Contract
   *
   * @param {DataContract|RawDataContract} contract
   * @return {ValidationResult}
   */
  validate(contract) {
    return this.validateContract(contract);
  }
}

module.exports = DataContractFacade;
