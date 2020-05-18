const getIdentityTopUpSTFixture = require('../../../../../lib/test/fixtures/getIdentityTopUpSTFixture');

const validateIdentityTopUpSTStructureFactory = require(
  '../../../../../lib/identity/stateTransitions/identityTopUpTransition/validateIdentityTopUpSTStructureFactory',
);

const IdentityTopUpTransition = require(
  '../../../../../lib/identity/stateTransitions/identityTopUpTransition/IdentityTopUpTransition',
);

const ValidationResult = require('../../../../../lib/validation/ValidationResult');

describe('validateIdentityTopUpSTStructureFactory', () => {
  let validateIdentityTopUpST;
  let rawStateTransition;
  let stateTransition;
  let validatePublicKeysMock;

  beforeEach(function beforeEach() {
    validatePublicKeysMock = this.sinonSandbox.stub().returns(new ValidationResult());

    validateIdentityTopUpST = validateIdentityTopUpSTStructureFactory(
      validatePublicKeysMock,
    );

    stateTransition = getIdentityTopUpSTFixture();

    rawStateTransition = stateTransition.toJSON();
  });

  it('should pass valid raw state transition', () => {
    const result = validateIdentityTopUpST(rawStateTransition);

    expect(result.isValid()).to.be.true();

    expect(validatePublicKeysMock).to.be.calledOnceWithExactly(
      rawStateTransition.publicKeys,
    );
  });

  it('should pass valid state transition', () => {
    const result = validateIdentityTopUpST(new IdentityTopUpTransition(rawStateTransition));

    expect(result.isValid()).to.be.true();

    expect(validatePublicKeysMock).to.be.calledOnceWithExactly(
      rawStateTransition.publicKeys,
    );
  });
});
