const ConsensusError = require('./ConsensusError');

class IdentityAlreadyExistsError extends ConsensusError {
  /**
   * @param {IdentityCreateStateTransition} stateTransition
   */
  constructor(stateTransition) {
    super(`Identity with id ${stateTransition.getIdentityId()} already exists`);

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
