const ConsensusError = require('./ConsensusError');

class DuplicatedIdentitySTPublicKeyError extends ConsensusError {
  /**
   * @param {IdentityCreateStateTransition} stateTransition
   */
  constructor(stateTransition) {
    super('Duplicated public keys found in identity state transition');

    this.stateTransition = stateTransition;
  }

  /**
   * Get Document
   *
   * @return {Document}
   */
  getStateTransition() {
    return this.stateTransition;
  }

  /**
   * Get index definition
   *
   * @return {Object}
   */
  getIndexDefinition() {
    return this.indexDefinition;
  }
}

module.exports = DuplicatedIdentitySTPublicKeyError;
