const { IDENTITY_TYPES } = require('../../../../lib/identity/constants');

const checkIdentityFactory = require('../../../../lib/stateTransition/validation/checkIdentityFactory');

const createDataProviderMock = require('../../../../lib/test/mocks/createDataProviderMock');

const { expectValidationError } = require('../../../../lib/test/expect/expectError');

const ValidationResult = require('../../../../lib/validation/ValidationResult');

const IdentityNotFoundError = require('../../../../lib/errors/IdentityNotFoundError');
const UnexpectedIdentityTypeError = require('../../../../lib/errors/UnexpectedIdentityTypeError');

describe('checkIdentityFactory', () => {
  let checkIdentity;
  let dataProviderMock;
  let userId;
  let rawIdentityUser;

  beforeEach(function beforeEach() {
    dataProviderMock = createDataProviderMock(this.sinonSandbox);

    checkIdentity = checkIdentityFactory(
      dataProviderMock,
    );

    userId = 'iTYF+bWBA4MYRURcsBpBkgfwiqV7sYVnTDPR4uQ/KLU=';

    rawIdentityUser = {
      id: userId,
      identityType: IDENTITY_TYPES.USER,
      publicKeys: [
        {
          id: 1,
          type: 1,
          publicKey: 'z3HAPrJkpgffXX0b3w0lb/PZs6A5IXzHj1p8Fnzmgmk=',
          isEnabled: true,
        },
      ],
    };
  });

  it('should return invalid result if identity is not found', async () => {
    const result = await checkIdentity(userId, IDENTITY_TYPES.USER);

    expectValidationError(result, IdentityNotFoundError);

    const [error] = result.getErrors();

    expect(error.getIdentityId()).to.equal(userId);
  });

  it('should return invalid result if the identity has the wrong type', async () => {
    dataProviderMock.fetchIdentity.resolves(rawIdentityUser);

    const result = await checkIdentity(userId, IDENTITY_TYPES.APPLICATION);

    expectValidationError(result, UnexpectedIdentityTypeError);

    const [error] = result.getErrors();

    expect(error.getIdentity()).to.equal(rawIdentityUser);
    expect(error.getExpectedIdentityType()).to.equal(IDENTITY_TYPES.APPLICATION);

    expect(dataProviderMock.fetchIdentity).to.be.calledOnceWith(userId);
  });

  it('should return valid result', async () => {
    dataProviderMock.fetchIdentity.resolves(rawIdentityUser);

    const result = await checkIdentity(userId, IDENTITY_TYPES.USER);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();
  });
});
