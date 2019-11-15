const { expectValidationError } = require(
  '../../../../../../lib/test/expect/expectError',
);

const validateIdentityCreateSTDataFactory = require(
  '../../../../../../lib/identity/stateTransitions/validation/data/validateIdentityCreateSTDataFactory',
);

const IdentityCreateStateTransition = require(
  '../../../../../../lib/identity/stateTransitions/IdentityCreateStateTransition',
);

const IdentitySTWrongVersionError = require(
  '../../../../../../lib/errors/IdentitySTWrongVersionError',
);

describe('validateIdentityCreateSTDataFactory', () => {
  let validateIdentityCreateSTData;
  let rawStateTransition;
  let stateTransition;

  beforeEach(() => {
    validateIdentityCreateSTData = validateIdentityCreateSTDataFactory();

    rawStateTransition = {
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

    stateTransition = new IdentityCreateStateTransition(rawStateTransition);
  });

  it('should throw an error if state transition version is higher than one currently set', () => {
    stateTransition.identityCreateStateTransitionVersion = 42;

    const result = validateIdentityCreateSTData(stateTransition);

    expectValidationError(result, IdentitySTWrongVersionError, 1);

    const [error] = result.getErrors();

    expect(error.message).to.equal('Identity state transition version is too high');
  });
});
