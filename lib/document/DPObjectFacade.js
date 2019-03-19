const enrichDPContractWithBaseDPObject = require('./enrichDPContractWithBaseDPObject');
const validateDPObjectFactory = require('./validateDPObjectFactory');

const DPObjectFactory = require('./DPObjectFactory');

const MissingOptionError = require('../errors/MissingOptionError');

class DPObjectFacade {
  /**
   *
   * @param {DashPlatformProtocol} dpp
   * @param {JsonSchemaValidator} validator
   */
  constructor(dpp, validator) {
    this.dpp = dpp;

    this.validateDPObject = validateDPObjectFactory(
      validator,
      enrichDPContractWithBaseDPObject,
    );

    this.factory = new DPObjectFactory(
      dpp.getUserId(),
      dpp.getDPContract(),
      this.validateDPObject,
    );
  }

  /**
   * Create Document
   *
   * @param {string} type
   * @param {Object} [data]
   * @return {Document}
   */
  create(type, data = {}) {
    return this.getFactory().create(type, data);
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
    return this.getFactory().createFromObject(rawDocument, options);
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
    return this.getFactory().createFromSerialized(payload, options);
  }

  /**
   *
   * @param {Object|Document} document
   * @return {ValidationResult}
   */
  validate(document) {
    return this.validateDPObject(document, this.dpp.getDPContract());
  }

  /**
   * @private
   * @return {DPObjectFactory}
   */
  getFactory() {
    if (!this.dpp.getUserId()) {
      throw new MissingOptionError(
        'userId',
        'Can\'t create packet because User ID is not set, use setUserId method',
      );
    }

    if (!this.dpp.getDPContract()) {
      throw new MissingOptionError(
        'dpContract',
        'Can\'t create Document because DP Contract is not set, use setDPContract method',
      );
    }

    this.factory.setUserId(this.dpp.getUserId());
    this.factory.setDPContract(this.dpp.getDPContract());

    return this.factory;
  }
}

module.exports = DPObjectFacade;