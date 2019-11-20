const getIdentityCreateSTFixture = require('../../../../../../lib/test/fixtures/getIdentityCreateSTFixture');

const { expectValidationError } = require(
  '../../../../../../lib/test/expect/expectError',
);

const validateIdentityCreateSTDataFactory = require(
  '../../../../../../lib/identity/stateTransitions/validation/data/validateIdentityCreateSTDataFactory',
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
  let stateTransition;
  let dataProviderMock;

  beforeEach(function beforeEach() {
    dataProviderMock = createDataProviderMock(this.sinonSandbox);
    validateIdentityCreateSTData = validateIdentityCreateSTDataFactory(dataProviderMock);

    stateTransition = getIdentityCreateSTFixture();
  });

  it('should throw an error if identity type is unknown', async () => {
    stateTransition.identityType = 42;

    const result = await validateIdentityCreateSTData(stateTransition);

    expectValidationError(result, UnknownIdentityTypeError, 1);

    const [error] = result.getErrors();

    expect(error.message).to.equal('Identity type is within the reserved types range, but is unknown to the protocol');
    expect(error.getStateTransition()).to.deep.equal(stateTransition);
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
    expect(error.getStateTransition()).to.deep.equal(stateTransition);
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
    expect(error.getStateTransition()).to.deep.equal(stateTransition);
  });

  it('should throw an error if identity already exists', async () => {
    dataProviderMock.fetchIdentity.resolves({});

    const result = await validateIdentityCreateSTData(stateTransition);

    expectValidationError(result, IdentityAlreadyExistsError, 1);

    const [error] = result.getErrors();

    expect(error.message).to.equal(`Identity with id ${stateTransition.getIdentityId()} already exists`);
    expect(error.getStateTransition()).to.deep.equal(stateTransition);
  });

  it('should pass valid state transition', async () => {
    const result = await validateIdentityCreateSTData(stateTransition);

    expect(result.isValid()).to.be.true();
  });
});
