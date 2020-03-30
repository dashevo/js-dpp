const { Transaction } = require('@dashevo/dashcore-lib');
const IdentityFactory = require('./IdentityFactory');
const validateIdentityFactory = require('./validation/validateIdentityFactory');
const applyIdentityStateTransitionFactory = require('./stateTransitions/applyIdentityStateTransitionToModelFactory');
const getLockedTransactionOutputFactory = require('../stateTransition/getLockedTransactionOutputFactory');
const validatePublicKeysFactory = require('./validation/validatePublicKeysFactory');

/**
 * @class IdentityFacade
 * @property {validateIdentity} validateIdentity
 */
class IdentityFacade {
  /**
   * @param {StateRepository} stateRepository
   * @param {JsonSchemaValidator} validator
   */
  constructor(validator, stateRepository) {
    const validatePublicKeys = validatePublicKeysFactory(
      validator,
    );
    this.validateIdentity = validateIdentityFactory(
      validator,
      validatePublicKeys,
    );
    this.factory = new IdentityFactory(this.validateIdentity);

    const getLockedTransactionOutput = getLockedTransactionOutputFactory(
      stateRepository,
      Transaction.parseOutPointBuffer,
    );

    this.applyIdentityStateTransition = applyIdentityStateTransitionFactory(
      getLockedTransactionOutput,
    );
  }

  /**
   * Create Identity
   *
   * @param {string} id
   * @param {IdentityPublicKey[]} [publicKeys]
   * @return {Identity}
   */
  create(id, publicKeys = []) {
    return this.factory.create(id, publicKeys);
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
   * @param [options]
   * @param {boolean} [options.skipValidation]
   * @return {Identity}
   */
  createFromSerialized(serializedIdentity, options = {}) {
    return this.factory.createFromSerialized(serializedIdentity, options);
  }

  /**
   * Applies a state transition to the identity model
   *
   * @param {IdentityCreateTransition} stateTransition
   * @param {Identity|null} identity
   * @return {Identity|null}
   */
  async applyStateTransition(stateTransition, identity) {
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
