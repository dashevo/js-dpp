const WrongStateTransitionTypeError = require('./errors/WrongStateTransitionTypeError');

const stateTransitionTypes = require('./stateTransitionTypes');

/**
 * Update state by applying transition (factory)
 *
 * @param {applyDataContractStateTransition} applyDataContractStateTransition
 * @param {applyDocumentsBatchTransition} applyDocumentsBatchTransition
 * @param {applyIdentityStateTransition} applyIdentityStateTransition
 *
 * @returns {apply}
 */
function applyFactory(
  applyDataContractStateTransition,
  applyDocumentsBatchTransition,
  applyIdentityStateTransition,
) {
  /**
   * Update state by applying transition
   *
   * @typedef apply
   *
   * @param {AbstractStateTransition} stateTransition
   *
   * @returns {Promise<void>}
   */
  async function apply(stateTransition) {
    switch (stateTransition.getType()) {
      case stateTransitionTypes.DATA_CONTRACT_CREATE: {
        await applyDataContractStateTransition(stateTransition);
        break;
      }
      case stateTransitionTypes.DOCUMENTS: {
        await applyDocumentsBatchTransition(stateTransition);
        break;
      }
      case stateTransitionTypes.IDENTITY_CREATE: {
        await applyIdentityStateTransition(stateTransition);
        break;
      }
      default:
        throw new WrongStateTransitionTypeError(stateTransition);
    }
  }

  return apply;
}

module.exports = applyFactory;
