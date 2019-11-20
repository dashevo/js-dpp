const IdentityCreateStateTransition = require('../../identity/stateTransitions/IdentityCreateStateTransition');

const Identity = require('../../identity/Identity');

/**
 *
 * @return {IdentityCreateStateTransition}
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

  return new IdentityCreateStateTransition(rawStateTransition);
};
