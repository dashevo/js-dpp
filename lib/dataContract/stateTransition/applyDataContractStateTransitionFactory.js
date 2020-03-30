/**
 * Apply data contract state transition (factory)
 *
 * @param {StateRepository} stateRepository
 * @param {applyStateTransitionToModel} applyStateTransitionToModel
 *
 * @returns {applyDataContractStateTransition}
 */
function applyDataContractStateTransitionFactory(
  stateRepository,
  applyStateTransitionToModel,
) {
  /**
   * Apply data contract state transition
   *
   * @param {DataContractCreateTransition} stateTransition
   *
   * @typedef applyDataContractStateTransition
   *
   * @return {Promise<void>}
   */
  async function applyDataContractStateTransition(stateTransition) {
    const existingDataContract = await stateRepository.fetchDataContract(
      stateTransition.getDataContract().getId(),
    );

    const dataContract = applyStateTransitionToModel(
      stateTransition, existingDataContract,
    );

    await stateRepository.storeDataContract(dataContract);
  }

  return applyDataContractStateTransition;
}

module.exports = applyDataContractStateTransitionFactory;
