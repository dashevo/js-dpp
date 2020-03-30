const WrongStateTransitionTypeError = require('./errors/WrongStateTransitionTypeError');

const stateTransitionTypes = require('./stateTransitionTypes');

/**
 * Update state by applying transition (factory)
 *
 * @param {applyDataContractCreateTransition} applyDataContractCreateTransition
 * @param {applyDocumentsBatchTransition} applyDocumentsBatchTransition
 * @param {applyIdentityCreateTransition} applyIdentityCreateTransition
 *
 * @returns {apply}
 */
function applyFactory(
  applyDataContractCreateTransition,
  applyDocumentsBatchTransition,
  applyIdentityCreateTransition,
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
        await applyDataContractCreateTransition(stateTransition);
        break;
      }
      case stateTransitionTypes.DOCUMENTS: {
        await applyDocumentsBatchTransition(stateTransition);
        break;
      }
      case stateTransitionTypes.IDENTITY_CREATE: {
        await applyIdentityCreateTransition(stateTransition);
        break;
      }
      default:
        throw new WrongStateTransitionTypeError(stateTransition);
    }
  }

  return apply;
}

module.exports = applyFactory;
