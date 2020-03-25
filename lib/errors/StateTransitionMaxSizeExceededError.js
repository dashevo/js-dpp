const ConsensusError = require('./ConsensusError');

class StateTransitionMaxSizeExceededError extends ConsensusError {
  /**
   * @param {RawDataContractCreateTransition|RawDocumentsStateTransition} rawStateTransition
   * @param {number} maxSizeKBytes
   */
  constructor(rawStateTransition, maxSizeKBytes) {
    super(`State transition size is more than ${maxSizeKBytes}kb`);

    this.rawStateTransition = rawStateTransition;
  }

  /**
   * Get raw State Transition
   *
   * @return {RawDataContractCreateTransition|RawDocumentsStateTransition}
   */
  getRawStateTransition() {
    return this.rawStateTransition;
  }
}

module.exports = StateTransitionMaxSizeExceededError;
