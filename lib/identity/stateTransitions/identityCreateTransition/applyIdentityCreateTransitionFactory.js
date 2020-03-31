const Identity = require('../../Identity');

const { convertSatoshiToCredits } = require('../../creditsConverter');
const calculateStateTransitionFee = require('../../../stateTransition/calculateStateTransitionFee');

/**
 * @param {StateRepository} stateRepository
 * @param {getLockedTransactionOutput} getLockedTransactionOutput
 *
 * @returns {applyIdentityCreateTransition}
 */
function applyIdentityCreateTransitionFactory(
  stateRepository,
  getLockedTransactionOutput,
) {
  /**
   * Apply identity state transition
   *
   * @typedef applyIdentityCreateTransition
   *
   * @param {IdentityCreateTransition} stateTransition
   *
   * @return {Promise<void>}
   */
  async function applyIdentityCreateTransition(stateTransition) {
    const fee = calculateStateTransitionFee(stateTransition);
    const output = await getLockedTransactionOutput(stateTransition.getLockedOutPoint());
    const creditsAmount = convertSatoshiToCredits(output.satoshi);

    const balance = creditsAmount - fee;

    const identity = new Identity({
      id: stateTransition.getIdentityId(),
      publicKeys: stateTransition.getPublicKeys().map((key) => key.toJSON()),
      balance,
    });

    await stateRepository.storeIdentity(identity);
  }

  return applyIdentityCreateTransition;
}

module.exports = applyIdentityCreateTransitionFactory;
