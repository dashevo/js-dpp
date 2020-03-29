const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');

const WrongStateTransitionTypeError = require('../errors/WrongStateTransitionTypeError');
const DataContractAlreadyExistsError = require('../errors/DataContractAlreadyExistsError');

/**
 * Apply data contract state transition
 *
 * @param {DataContractCreateTransition} stateTransition
 * @param {DataContract|null} dataContract
 *
 * @return {DataContract|null}
 */
function applyDataContractStateTransition(stateTransition, dataContract) {
  switch (stateTransition.getType()) {
    case stateTransitionTypes.DATA_CONTRACT_CREATE: {
      if (dataContract) {
        throw new DataContractAlreadyExistsError(stateTransition);
      }

      return stateTransition.getDataContract();
    }
    default:
      throw new WrongStateTransitionTypeError(stateTransition);
  }
}

module.exports = applyDataContractStateTransition;
