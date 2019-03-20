const DPContractFactory = require('./DPContractFactory');
const validateContractFactory = require('./validateContractFactory');
const createContract = require('./createContract');

class DPContractFacade {
  /**
   *
   * @param {JsonSchemaValidator} validator
   */
  constructor(validator) {
    this.validateContract = validateContractFactory(validator);

    this.factory = new DPContractFactory(
      createContract,
      this.validateContract,
    );
  }

  /**
   * Create Contract
   *
   * @param {string} name
   * @param {Object} documents
   * @return {Contract}
   */
  create(name, documents) {
    return this.factory.create(name, documents);
  }

  /**
   * Create Contract from plain object
   *
   * @param {Object} rawDPContract
   * @param {Object} options
   * @param {boolean} [options.skipValidation=false]
   * @return {Contract}
   */
  createFromObject(rawDPContract, options = { skipValidation: false }) {
    return this.factory.createFromObject(rawDPContract, options);
  }

  /**
   * Create Contract from string/buffer
   *
   * @param {Buffer|string} payload
   * @param {Object} options
   * @param {boolean} [options.skipValidation=false]
   * @return {Contract}
   */
  createFromSerialized(payload, options = { skipValidation: false }) {
    return this.factory.createFromSerialized(payload, options);
  }

  /**
   *
   * @param {Contract|Object} dpContract
   * @return {ValidationResult}
   */
  validate(dpContract) {
    return this.validateContract(dpContract);
  }
}

module.exports = DPContractFacade;
