const InvalidContractError = require('./errors/InvalidContractError');

const { decode } = require('../util/serializer');

class ContractFactory {
  /**
   * @param {createContract} createContract
   * @param {validateContract} validateContract
   */
  constructor(createContract, validateContract) {
    this.createContract = createContract;
    this.validateContract = validateContract;
  }

  /**
   * Create Contract
   *
   * @param {string} name
   * @param {Object} documents
   * @return {Contract}
   */
  create(name, documents) {
    return this.createContract({
      name,
      documents,
    });
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
    if (!options.skipValidation) {
      const result = this.validateContract(rawDPContract);

      if (!result.isValid()) {
        throw new InvalidContractError(result.getErrors(), rawDPContract);
      }
    }

    return this.createContract(rawDPContract);
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
    const rawDPContract = decode(payload);

    return this.createFromObject(rawDPContract, options);
  }
}

module.exports = ContractFactory;
