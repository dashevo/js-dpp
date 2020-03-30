const DataContractAlreadyExistsError = require('../errors/DataContractAlreadyExistsError');

/**
 * Apply data contract state transition (factory)
 *
 * @param {StateRepository} stateRepository
 *
 * @returns {applyDataContractCreateTransition}
 */
function applyDataContractCreateTransitionFactory(stateRepository) {
  /**
   * Apply data contract state transition
   *
   * @typedef applyDataContractCreateTransition
   *
   * @param {DataContractCreateTransition} stateTransition
   *
   * @return {Promise<void>}
   */
  async function applyDataContractCreateTransition(stateTransition) {
    const existingDataContract = await stateRepository.fetchDataContract(
      stateTransition.getDataContract().getId(),
    );

    if (existingDataContract) {
      throw new DataContractAlreadyExistsError(stateTransition);
    }

    await stateRepository.storeDataContract(
      stateTransition.getDataContract(),
    );
  }

  return applyDataContractCreateTransition;
}

module.exports = applyDataContractCreateTransitionFactory;
