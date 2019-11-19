const Identity = require('../../../../lib/identity/model/Identity');

const validateIdentityTypeFactory = require('../../../../lib/stateTransition/validation/validateIdentityTypeFactory');

const createDataProviderMock = require('../../../../lib/test/mocks/createDataProviderMock');

const { expectValidationError } = require('../../../../lib/test/expect/expectError');

const ValidationResult = require('../../../../lib/validation/ValidationResult');

const IdentityNotFoundError = require('../../../../lib/errors/IdentityNotFoundError');
const UnexpectedIdentityTypeError = require('../../../../lib/errors/UnexpectedIdentityTypeError');

describe('validateIdentityTypeFactory', () => {
  let validateIdentityType;
  let dataProviderMock;
  let userId;
  let rawIdentityUser;

  beforeEach(function beforeEach() {
    dataProviderMock = createDataProviderMock(this.sinonSandbox);

    validateIdentityType = validateIdentityTypeFactory(
      dataProviderMock,
    );

    userId = 'iTYF+bWBA4MYRURcsBpBkgfwiqV7sYVnTDPR4uQ/KLU=';

    rawIdentityUser = {
      id: userId,
      identityType: Identity.TYPES.USER,
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
    const result = await validateIdentityType(userId, [Identity.TYPES.USER]);

    expectValidationError(result, IdentityNotFoundError);

    const [error] = result.getErrors();

    expect(error.getIdentityId()).to.equal(userId);
  });

  it('should return invalid result if the identity has the wrong type', async () => {
    dataProviderMock.fetchIdentity.resolves(rawIdentityUser);

    const result = await validateIdentityType(userId, [Identity.TYPES.APPLICATION]);

    expectValidationError(result, UnexpectedIdentityTypeError);

    const [error] = result.getErrors();

    expect(error.getIdentity()).to.equal(rawIdentityUser);
    expect(error.getExpectedIdentityTypes()).to.deep.equal([Identity.TYPES.APPLICATION]);

    expect(dataProviderMock.fetchIdentity).to.be.calledOnceWith(userId);
  });

  it('should return valid result', async () => {
    dataProviderMock.fetchIdentity.resolves(rawIdentityUser);

    const result = await validateIdentityType(userId, [Identity.TYPES.USER]);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();
  });
});
