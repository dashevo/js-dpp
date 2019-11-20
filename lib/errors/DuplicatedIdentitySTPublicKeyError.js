const ConsensusError = require('./ConsensusError');

class DuplicatedIdentitySTPublicKeyError extends ConsensusError {
  /**
   * @param {IdentityCreateTransition} stateTransition
   */
  constructor(stateTransition) {
    super('Duplicated public keys found in the identity state transition');

    this.stateTransition = stateTransition;
  }

  /**
   * Get identity create state transition
   *
   * @return {IdentityCreateTransition}
   */
  getStateTransition() {
    return this.stateTransition;
  }
}

module.exports = DuplicatedIdentitySTPublicKeyError;
