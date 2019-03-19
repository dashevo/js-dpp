const Document = require('./Document');

const { decode } = require('../util/serializer');
const entropy = require('../util/entropy');
const hash = require('../util/hash');

const InvalidDocumentError = require('./errors/InvalidDocumentError');
const InvalidDocumentTypeError = require('../errors/InvalidDocumentTypeError');

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
      throw new InvalidDocumentTypeError(type, this.dpContract);
    }

    const rawDocument = {
      $type: type,
      $scope: hash(this.dpContract.getId() + this.userId),
      $scopeId: entropy.generate(),
      $action: Document.DEFAULTS.ACTION,
      $rev: Document.DEFAULTS.REVISION,
      ...data,
    };

    return new Document(rawDocument);
  }


  /**
   * Create Document from plain object
   *
   * @param {Object} rawDocument
   * @param {Object} options
   * @param {boolean} [options.skipValidation=false]
   * @return {Document}
   */
  createFromObject(rawDocument, options = { skipValidation: false }) {
    if (!options.skipValidation) {
      const result = this.validateDPObject(rawDocument, this.dpContract);

      if (!result.isValid()) {
        throw new InvalidDocumentError(result.getErrors(), rawDocument);
      }
    }

    return new Document(rawDocument);
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
    const rawDocument = decode(payload);

    return this.createFromObject(rawDocument, options);
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