const ConsensusError = require('./ConsensusError');

class IdentityAlreadyExistsError extends ConsensusError {
  /**
   * @param {IdentityCreateStateTransition} stateTransition
   */
  constructor(stateTransition) {
    super('Duplicated public keys found in the identity state transition');

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

module.exports = IdentityAlreadyExistsError;
