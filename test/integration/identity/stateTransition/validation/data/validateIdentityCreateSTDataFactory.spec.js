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

const UnknownIdentityTypeError = require(
  '../../../../../../lib/errors/UnknownIdentityTypeError',
);

const DuplicatedIdentitySTPublicKeyError = require(
  '../../../../../../lib/errors/DuplicatedIdentitySTPublicKeyError',
);

const DuplicatedIdentitySTPublicKeyIdError = require(
  '../../../../../../lib/errors/DuplicatedIdentitySTPublicKeyIdError',
);

const IdentityAlreadyExistsError = require(
  '../../../../../../lib/errors/IdentityAlreadyExistsError',
);

const createDataProviderMock = require('../../../../../../lib/test/mocks/createDataProviderMock');

describe('validateIdentityCreateSTDataFactory', () => {
  let validateIdentityCreateSTData;
  let rawStateTransition;
  let stateTransition;
  let dataProviderMock;

  beforeEach(function beforeEach() {
    dataProviderMock = createDataProviderMock(this.sinonSandbox);
    validateIdentityCreateSTData = validateIdentityCreateSTDataFactory(dataProviderMock);

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

  it('should throw an error if state transition version is higher than one currently set', async () => {
    stateTransition.identityCreateStateTransitionVersion = 42;

    const result = await validateIdentityCreateSTData(stateTransition);

    expectValidationError(result, IdentitySTWrongVersionError, 1);

    const [error] = result.getErrors();

    expect(error.message).to.equal('Identity state transition version is too high');
  });

  it('should throw an error if identity type is unknown', async () => {
    stateTransition.identityType = 42;

    const result = await validateIdentityCreateSTData(stateTransition);

    expectValidationError(result, UnknownIdentityTypeError, 1);

    const [error] = result.getErrors();

    expect(error.message).to.equal('Identity type is within the reserved types range, but is unknown to the protocol');
  });

  it('should throw an error if keys have same ids', async () => {
    stateTransition.publicKeys = [
      { id: 1, publicKey: 'a' },
      { id: 1, publicKey: 'b' },
    ];

    const result = await validateIdentityCreateSTData(stateTransition);

    expectValidationError(result, DuplicatedIdentitySTPublicKeyIdError, 1);

    const [error] = result.getErrors();

    expect(error.message).to.equal('Duplicated public key ids found in the identity state transition');
  });

  it('should throw an error if keys have same key strings', async () => {
    stateTransition.publicKeys = [
      { id: 1, publicKey: 'a' },
      { id: 2, publicKey: 'a' },
    ];

    const result = await validateIdentityCreateSTData(stateTransition);

    expectValidationError(result, DuplicatedIdentitySTPublicKeyError, 1);

    const [error] = result.getErrors();

    expect(error.message).to.equal('Duplicated public keys found in the identity state transition');
  });

  it('should throw an error if identity already exists', async () => {
    dataProviderMock.fetchIdentity.resolves({});

    const result = await validateIdentityCreateSTData(stateTransition);

    expectValidationError(result, IdentityAlreadyExistsError, 1);

    const [error] = result.getErrors();

    expect(error.message).to.equal(`Identity with id ${stateTransition.getIdentityId()} already exists`);
  });

  it('should pass valid state transition', async () => {
    const result = await validateIdentityCreateSTData(stateTransition);

    expect(result.isValid()).to.be.true();
  });
});
