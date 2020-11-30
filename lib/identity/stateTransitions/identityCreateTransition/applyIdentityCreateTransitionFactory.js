const Identity = require('../../Identity');

const { convertSatoshiToCredits } = require('../../creditsConverter');

/**
 * @param {StateRepository} stateRepository
 *
 * @returns {applyIdentityCreateTransition}
 */
function applyIdentityCreateTransitionFactory(
  stateRepository,
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
    const assetLock = stateTransition.getAssetLock();
    const output = assetLock.getOutput();
    const outPoint = assetLock.getTransaction().getOutPointBuffer(assetLock.getOutputIndex());

    const creditsAmount = convertSatoshiToCredits(output.satoshis);

    const identity = new Identity({
      protocolVersion: stateTransition.getProtocolVersion(),
      id: stateTransition.getIdentityId().toBuffer(),
      publicKeys: stateTransition.getPublicKeys().map((key) => key.toObject()),
      balance: creditsAmount,
      revision: 0,
    });

    await stateRepository.storeIdentity(identity);

    const publicKeyHashes = identity
      .getPublicKeys()
      .map((publicKey) => publicKey.hash());

    await stateRepository.storeIdentityPublicKeyHashes(
      identity.getId(),
      publicKeyHashes,
    );

    await stateRepository.storeAssetLockTransactionOutPoint(outPoint);
  }

  return applyIdentityCreateTransition;
}

module.exports = applyIdentityCreateTransitionFactory;
