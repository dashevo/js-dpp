const ConsensusError = require('./ConsensusError');

class DuplicatedIdentitySTPublicKeyIdError extends ConsensusError {
  /**
   * @param {IdentityCreateStateTransition} stateTransition
   */
  constructor(stateTransition) {
    super('Duplicated public key ids found in the identity state transition');

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
}

module.exports = DuplicatedIdentitySTPublicKeyIdError;
