const { convertSatoshiToCredits } = require('../../creditsConverter');

/**
 * @param {StateRepository} stateRepository
 * @param {fetchAssetLockTransactionOutput} fetchAssetLockTransactionOutput
 *
 * @returns {applyIdentityTopUpTransition}
 */
function applyIdentityTopUpTransitionFactory(
  stateRepository,
  fetchAssetLockTransactionOutput,
) {
  /**
   * Apply identity state transition
   *
   * @typedef applyIdentityTopUpTransition
   *
   * @param {IdentityTopUpTransition} stateTransition
   *
   * @return {Promise<void>}
   */
  async function applyIdentityTopUpTransition(stateTransition) {
    console.log('before 2', stateTransition);

    const output = await fetchAssetLockTransactionOutput(stateTransition.getAssetLockProof());
    const outPoint = stateTransition.getAssetLockProof().getOutPoint();
    console.log('output', output);

    const creditsAmount = convertSatoshiToCredits(output.satoshis);
    console.log('creditsAmount', creditsAmount, output.satoshis);
    const identityId = stateTransition.getIdentityId();

    const identity = await stateRepository.fetchIdentity(identityId);
    identity.increaseBalance(creditsAmount);

    await stateRepository.storeIdentity(identity);

    await stateRepository.markAssetLockTransactionOutPointAsUsed(outPoint);
  }

  return applyIdentityTopUpTransition;
}

module.exports = applyIdentityTopUpTransitionFactory;
