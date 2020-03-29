const Identity = require('../Identity');

const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');

const WrongStateTransitionTypeError = require('../../stateTransition/errors/WrongStateTransitionTypeError');
const IdentityAlreadyExistsError = require('../../errors/IdentityAlreadyExistsError');

const { convertSatoshiToCredits } = require('../creditsConverter');

/**
 *
 * @param {getLockedTransactionOutput} getLockedTransactionOutput
 * @return {applyIdentityStateTransition}
 */
function applyIdentityStateTransitionFactory(
  getLockedTransactionOutput,
) {
  /**
   * Applies a state transition to the identity model.
   * Only identity state transitions are allowed
   *
   * @typedef applyIdentityStateTransition
   * @param {IdentityCreateTransition} stateTransition
   * @param {Identity|null} identity
   * @return {Identity|null}
   */
  async function applyIdentityStateTransition(stateTransition, identity) {
    // noinspection JSRedundantSwitchStatement
    switch (stateTransition.getType()) {
      case stateTransitionTypes.IDENTITY_CREATE: {
        if (identity) {
          throw new IdentityAlreadyExistsError(stateTransition);
        }

        const output = await getLockedTransactionOutput(stateTransition.getLockedOutPoint());
        const creditsAmount = convertSatoshiToCredits(output.satoshi);

        return new Identity({
          id: stateTransition.getIdentityId(),
          publicKeys: stateTransition.getPublicKeys().map((key) => key.toJSON()),
          balance: creditsAmount,
        });
      }
      default:
        throw new WrongStateTransitionTypeError(stateTransition);
    }
  }

  return applyIdentityStateTransition;
}

module.exports = applyIdentityStateTransitionFactory;