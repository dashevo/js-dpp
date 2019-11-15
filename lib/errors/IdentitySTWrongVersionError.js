const ConsensusError = require('./ConsensusError');

class IdentitySTWrongVersionError extends ConsensusError {
  /**
   * @param {IdentityCreateStateTransition} stateTransition
   * @param {number} currentVersion
   */
  constructor(stateTransition, currentVersion) {
    super('Identity state transition version is too high');

    this.name = this.constructor.name;
    this.currentVersion = currentVersion;

    this.stateTransition = stateTransition;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Get failed state transition
   *
   * @return {AbstractStateTransition}
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
