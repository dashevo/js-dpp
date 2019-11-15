const ConsensusError = require('../../errors/ConsensusError');

class IdentitySTWrongVersionError extends ConsensusError {
  /**
   * @param {IdentityCreateStateTransition} stateTransition
   * @param {number} currentVersion
   */
  constructor(stateTransition, currentVersion) {
    super();

    this.name = this.constructor.name;
    this.message = 'Identity state transition version is too high';
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
