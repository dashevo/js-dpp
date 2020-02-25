const generateRandomId = require('../../../../lib/test/utils/generateRandomId');

const IdentityPublicKey = require('../../../../lib/identity/IdentityPublicKey');

const validateIdentityExistenceFactory = require('../../../../lib/stateTransition/validation/validateIdentityExistenceFactory');

const createDataProviderMock = require('../../../../lib/test/mocks/createDataProviderMock');

const { expectValidationError } = require('../../../../lib/test/expect/expectError');

const ValidationResult = require('../../../../lib/validation/ValidationResult');

const IdentityNotFoundError = require('../../../../lib/errors/IdentityNotFoundError');

describe('validateIdentityExistence', () => {
  let validateIdentityExistence;
  let dataProviderMock;
  let userId;
  let rawIdentityUser;

  beforeEach(function beforeEach() {
    dataProviderMock = createDataProviderMock(this.sinonSandbox);

    validateIdentityExistence = validateIdentityExistenceFactory(
      dataProviderMock,
    );

    userId = generateRandomId();

    rawIdentityUser = {
      id: userId,
      publicKeys: [
        {
          id: 1,
          type: IdentityPublicKey.TYPES.ECDSA_SECP256K1,
          data: 'z3HAPrJkpgffXX0b3w0lb/PZs6A5IXzHj1p8Fnzmgmk=',
          isEnabled: true,
        },
      ],
    };
  });

  it('should return invalid result if identity is not found', async () => {
    const result = await validateIdentityExistence(userId);

    expectValidationError(result, IdentityNotFoundError);

    const [error] = result.getErrors();

    expect(error.getIdentityId()).to.equal(userId);
  });

  it('should return valid result', async () => {
    dataProviderMock.fetchIdentity.resolves(rawIdentityUser);

    const result = await validateIdentityExistence(userId);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();
  });
});
