const Identity = require('../../Identity');

const { convertSatoshiToCredits } = require('../../creditsConverter');

/**
 * @param {StateRepository} stateRepository
 * @param {getLockedTransactionOutput} getLockedTransactionOutput
 *
 * @returns {applyIdentityCreateTransition}
 */
function applyIdentityTopUpTransitionFactory(
  stateRepository,
  getLockedTransactionOutput,
) {
  /**
   * Apply identity state transition
   *
   * @typedef applyIdentityCreateTransition
   *
   * @param {IdentityTopUpTransition} stateTransition
   *
   * @return {Promise<void>}
   */
  async function applyIdentityCreateTransition(stateTransition) {
    const output = await getLockedTransactionOutput(stateTransition.getLockedOutPoint());
    const creditsAmount = convertSatoshiToCredits(output.satoshis);
    const identityId = stateTransition.getIdentityId();

    const identity = await stateRepository.fetchIdentity(identityId);
    identity.increaseBalance(creditsAmount);

    await stateRepository.storeIdentity(identity);
  }

  return applyIdentityCreateTransition;
}

module.exports = applyIdentityTopUpTransitionFactory;
