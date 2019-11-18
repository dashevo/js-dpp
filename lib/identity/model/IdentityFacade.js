const IdentityFactory = require('./IdentityFactory');
const validateIdentityFactory = require('./validation/validateIdentityFactory');

/**
 * @class IdentityFacade
 * @property {validateIdentity} validateIdentity
 */
class IdentityFacade {
  /**
   * @param {JsonSchemaValidator} validator
   */
  constructor(validator) {
    this.validateIdentity = validateIdentityFactory(validator);
    this.factory = new IdentityFactory(this.validateIdentity);
  }

  /**
   * Create Identity
   *
   * @param {RawIdentity} data
   * @return {Identity}
   */
  create(data = {}) {
    return this.factory.createFromObject(data);
  }

  /**
   * Create Identity from the plain object
   *
   * @param {RawIdentity} rawIdentity
   * @return {Identity}
   */
  createFromObject(rawIdentity) {
    return this.factory.createFromObject(rawIdentity);
  }

  /**
   * Create identity from a string/Buffer
   *
   * @param {Buffer|string} serializedIdentity
   * @return {Identity}
   */
  createFromSerialized(serializedIdentity) {
    return this.factory.createFromSerialized(serializedIdentity);
  }

  /**
   * Validate identity
   *
   * @param {Identity|RawIdentity} identity
   * @return {ValidationResult}
   */
  validate(identity) {
    return this.validateIdentity(identity);
  }
}

module.exports = IdentityFacade;
