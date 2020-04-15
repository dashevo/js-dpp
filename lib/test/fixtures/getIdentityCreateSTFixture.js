const IdentityCreateTransition = require('../../identity/stateTransitions/identityCreateTransition/IdentityCreateTransition');

const IdentityPublicKey = require('../../identity/IdentityPublicKey');

const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');

/**
 *
 * @return {IdentityCreateTransition}
 */
module.exports = function getIdentityCreateSTFixture() {
  const rawStateTransition = {
    type: stateTransitionTypes.IDENTITY_CREATE,
    lockedOutPoint: Buffer.alloc(36).toString('base64'),
    publicKeys: [
      {
        id: 0,
        type: IdentityPublicKey.TYPES.ECDSA_SECP256K1,
        data: Buffer.alloc(240).toString('base64'),
        isEnabled: true,
      },
    ],
    protocolVersion: '0.12.0',
  };

  return new IdentityCreateTransition(rawStateTransition);
};
