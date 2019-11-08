const AbstractStateTransition = require('../../stateTransition/AbstractStateTransition');
const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');

class IdentityCreateStateTransition extends AbstractStateTransition {
  /**
   * Get State Transition type
   *
   * @return {number}
   */
  getType() {
    return stateTransitionTypes.IDENTITY_CREATE;
  }

  /**
   * Get Documents State Transition as plain object
   *
   * @return {RawIdentityCreateStateTransition}
   */
  toJSON() {
    return {
      ...super.toJSON(),
    };
  }
}

module.exports = IdentityCreateStateTransition;
