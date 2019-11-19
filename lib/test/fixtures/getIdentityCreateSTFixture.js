const IdentityCreateStateTransition = require('../../identity/stateTransitions/IdentityCreateStateTransition');

/**
 *
 * @return {IdentityCreateStateTransition}
 */
module.exports = function getIdentityCreateSTFixture() {
  const rawStateTransition = {
    identityCreateStateTransitionVersion: 0,
    lockedOutPoint: Buffer.alloc(36).toString('base64'),
    identityType: 0,
    publicKeys: [
      {
        id: 1,
        type: 1,
        publicKey: Buffer.alloc(240).toString('base64'),
        isEnabled: true,
      },
    ],
    ownershipProofSignature: Buffer.alloc(74).toString('base64'),
  };

  return new IdentityCreateStateTransition(rawStateTransition);
};