const identitySchema = require('../../../schema/model/identity');
const Identity = require('./Identity');

const MissingOptionError = require('../../errors/MissingOptionError');

/**
 * @class IdentityFacade
 * @property {JsonSchemaValidator} validator
 */
class IdentityFacade {
  /**
   * @param {JsonSchemaValidator} validator
   */
  constructor(validator) {
    this.validator = validator;
  }

  create() {}

  /**
   * Create Identity from the plain object
   *
   * @param rawIdentity
   * @return {Identity}
   */
  createFromObject(rawIdentity) {
    return new Identity(rawIdentity);
  }

  createFromSerialized() {}

  /**
   * @param {Identity|RawIdentity} identity
   * @return {ValidationResult}
   */
  validate(identity) {
    if (!this.validator) {
      throw new MissingOptionError(
        'validator',
        'Can\'t validate Identity because validator is not set in'
        + ' DashPlatformProtocol options',
      );
    }
    return this.validator.validate(identitySchema, identity);
  }
}

module.exports = IdentityFacade;
