const validateDuplicatePublicKeys = require('../../../../lib/identity/validation/validateDuplicatePublicKeys');

const getIdentityFixture = require('../../../../lib/test/fixtures/getIdentityFixture');

const { expectValidationError } = require('../../../../lib/test/expect/expectError');

const DuplicatedIdentityPublicKeyError = require('../../../../lib/errors/DuplicatedIdentityPublicKeyError');
const DuplicatedIdentityPublicKeyIdError = require('../../../../lib/errors/DuplicatedIdentityPublicKeyIdError');

const ValidationResult = require('../../../../lib/validation/ValidationResult');

describe('validateDuplicatePublicKeys', () => {
  let publicKeys;

  beforeEach(() => {
    const { publicKeys: [firstPublicKey] } = getIdentityFixture().toJSON();

    const secondPublicKey = { ...firstPublicKey };

    secondPublicKey.id = 2;
    secondPublicKey.data += 'abc';

    publicKeys = [firstPublicKey, secondPublicKey];
  });

  it('should return invalid result if there are duplicate key ids', () => {
    publicKeys[1].id = publicKeys[0].id;

    const result = validateDuplicatePublicKeys(publicKeys);

    expectValidationError(result, DuplicatedIdentityPublicKeyIdError);

    const [error] = result.getErrors();

    expect(error.getRawPublicKeys()).to.equal(publicKeys);
  });

  it('should return invalid result if there are duplicate keys', () => {
    publicKeys[1].data = publicKeys[0].data;

    const result = validateDuplicatePublicKeys(publicKeys);

    expectValidationError(result, DuplicatedIdentityPublicKeyError);

    const [error] = result.getErrors();

    expect(error.getRawPublicKeys()).to.equal(publicKeys);
  });

  it('should return valid result if there are no duplicate keys and ids', () => {
    const result = validateDuplicatePublicKeys(publicKeys);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();
  });
});
