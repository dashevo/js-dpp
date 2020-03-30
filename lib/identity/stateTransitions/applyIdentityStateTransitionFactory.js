/**
 * @param {StateRepository} stateRepository
 * @param {applyIdentityStateTransitionToModel} applyIdentityStateTransitionToModel
 *
 * @returns {applyIdentityStateTransition}
 */
function applyIdentityStateTransitionFactory(
  stateRepository,
  applyIdentityStateTransitionToModel,
) {
  /**
   * Apply identity state transition
   *
   * @typedef applyIdentityStateTransition
   *
   * @param {IdentityCreateTransition} stateTransition
   *
   * @return {Promise<void>}
   */
  async function applyIdentityStateTransition(stateTransition) {
    const existingIdentity = await stateRepository.fetchIdentity(
      stateTransition.getIdentityId(),
    );

    const identity = await applyIdentityStateTransitionToModel(stateTransition, existingIdentity);

    await stateRepository.storeIdentity(identity);
  }

  return applyIdentityStateTransition;
}

module.exports = applyIdentityStateTransitionFactory;
