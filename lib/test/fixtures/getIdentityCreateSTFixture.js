const IdentityCreateTransition = require('../../identity/stateTransitions/identityCreateTransition/IdentityCreateTransition');

const Identity = require('../../identity/Identity');

/**
 *
 * @return {IdentityCreateTransition}
 */
module.exports = function getIdentityCreateSTFixture() {
  const rawStateTransition = {
    lockedOutPoint: Buffer.alloc(36).toString('base64'),
    identityType: Identity.TYPES.USER,
    publicKeys: [
      {
        id: 1,
        type: 1,
        data: Buffer.alloc(240).toString('base64'),
        isEnabled: true,
      },
    ],
    ownershipProofSignature: Buffer.alloc(65).toString('base64'),
  };

  return new IdentityCreateTransition(rawStateTransition);
};
