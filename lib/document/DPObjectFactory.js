const Document = require('./Document');

const { decode } = require('../util/serializer');
const entropy = require('../util/entropy');
const hash = require('../util/hash');

const InvalidDPObjectError = require('./errors/InvalidDPObjectError');
const InvalidDPObjectTypeError = require('../errors/InvalidDPObjectTypeError');

class DPObjectFactory {
  /**
   * @param {DPContract} dpContract
   * @param {string} userId
   * @param {validateDPObject} validateDPObject
   */
  constructor(userId, dpContract, validateDPObject) {
    this.userId = userId;
    this.dpContract = dpContract;
    this.validateDPObject = validateDPObject;
  }

  /**
   * Create Document
   *
   * @param {string} type
   * @param {Object} [data]
   * @return {Document}
   */
  create(type, data = {}) {
    if (!this.dpContract.isDPObjectDefined(type)) {
      throw new InvalidDPObjectTypeError(type, this.dpContract);
    }

    const rawDPObject = {
      $type: type,
      $scope: hash(this.dpContract.getId() + this.userId),
      $scopeId: entropy.generate(),
      $action: Document.DEFAULTS.ACTION,
      $rev: Document.DEFAULTS.REVISION,
      ...data,
    };

    return new Document(rawDPObject);
  }


  /**
   * Create Document from plain object
   *
   * @param {Object} rawDPObject
   * @param {Object} options
   * @param {boolean} [options.skipValidation=false]
   * @return {Document}
   */
  createFromObject(rawDPObject, options = { skipValidation: false }) {
    if (!options.skipValidation) {
      const result = this.validateDPObject(rawDPObject, this.dpContract);

      if (!result.isValid()) {
        throw new InvalidDPObjectError(result.getErrors(), rawDPObject);
      }
    }

    return new Document(rawDPObject);
  }

  /**
   * Create Document from string/buffer
   *
   * @param {Buffer|string} payload
   * @param {Object} options
   * @param {boolean} [options.skipValidation=false]
   * @return {Document}
   */
  createFromSerialized(payload, options = { skipValidation: false }) {
    const rawDPObject = decode(payload);

    return this.createFromObject(rawDPObject, options);
  }

  /**
   * Set User ID
   *
   * @param userId
   * @return {DPObjectFactory}
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
   * Set DP Contract
   *
   * @param {DPContract} dpContract
   * @return {DPObjectFactory}
   */
  setDPContract(dpContract) {
    this.dpContract = dpContract;

    return this;
  }

  /**
   * Get DP Contract
   *
   * @return {DPContract}
   */
  getDPContract() {
    return this.dpContract;
  }
}

module.exports = DPObjectFactory;
