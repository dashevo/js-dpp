const IdentityFactory = require('./IdentityFactory');
const validateIdentityFactory = require('./validation/validateIdentityFactory');
const applyIdentityStateTransition = require('./stateTransitions/applyIdentityStateTransition');

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
    this.applyIdentityStateTransition = applyIdentityStateTransition;
  }

  /**
   * Create Identity
   *
   * @param {RawIdentity} data
   * @param [options]
   * @param {boolean} [options.skipValidation]
   * @return {Identity}
   */
  create(data = {}, options = {}) {
    return this.factory.createFromObject(data, options);
  }

  /**
   * Create Identity from the plain object
   *
   * @param {RawIdentity} rawIdentity
   * @param [options]
   * @param {boolean} [options.skipValidation]
   * @return {Identity}
   */
  createFromObject(rawIdentity, options = {}) {
    return this.factory.createFromObject(rawIdentity, options);
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
   * Applies a state transition to the identity model
   *
   * @param {IdentityCreateStateTransition} stateTransition
   * @param {Identity|null} identity
   * @return {Identity|null}
   */
  applyStateTransition(stateTransition, identity) {
    return this.applyIdentityStateTransition(stateTransition, identity);
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
