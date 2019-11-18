const identitySchema = require('../../../schema/model/identity');

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
  createFromObject() {}
  createFromSerialized() {}

  /**
   * @param {Identity|RawIdentity} identity
   * @return {ValidationResult}
   */
  validate(identity) {
    return this.validator.validate(identitySchema, identity);
  }
}

module.exports = IdentityFacade;
