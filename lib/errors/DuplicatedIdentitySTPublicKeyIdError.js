const ConsensusError = require('./ConsensusError');

class DuplicatedIdentitySTPublicKeyIdError extends ConsensusError {
  /**
   * @param {IdentityCreateTransition} stateTransition
   */
  constructor(stateTransition) {
    super('Duplicated public key ids found in the identity state transition');

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

module.exports = DuplicatedIdentitySTPublicKeyIdError;
