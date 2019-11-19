const ConsensusError = require('./ConsensusError');

class IdentitySTWrongVersionError extends ConsensusError {
  /**
   * @param {IdentityCreateStateTransition} stateTransition
   * @param {number} currentVersion
   */
  constructor(stateTransition, currentVersion) {
    super('Identity state transition version is too high');

    this.currentVersion = currentVersion;

    this.stateTransition = stateTransition;
  }

  /**
   * Get failed state transition
   *
   * @return {IdentityCreateStateTransition}
   */
  getStateTransition() {
    return this.stateTransition;
  }

  /**
   * Returns the current version of the identity state transition
   *
   * @return {number}
   */
  getVersion() {
    return this.currentVersion;
  }
}

module.exports = IdentitySTWrongVersionError;
