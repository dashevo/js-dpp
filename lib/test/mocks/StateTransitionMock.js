const AbstractStateTransitionSigned = require('../../stateTransition/AbstractStateTransitionSigned');
const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');

class StateTransitionMock extends AbstractStateTransitionSigned {
  getType() {
    return stateTransitionTypes.DATA_CONTRACT;
  }

  toJSON(options = {}) {
    return super.toJSON(options);
  }
}

module.exports = StateTransitionMock;
