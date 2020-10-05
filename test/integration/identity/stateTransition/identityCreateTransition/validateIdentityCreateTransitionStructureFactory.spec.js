const getIdentityCreateSTFixture = require('../../../../../lib/test/fixtures/getIdentityCreateSTFixture');

const validateIdentityCreateTransitionStructureFactory = require(
  '../../../../../lib/identity/stateTransitions/identityCreateTransition/validateIdentityCreateTransitionStructureFactory',
);

const IdentityCreateTransition = require(
  '../../../../../lib/identity/stateTransitions/identityCreateTransition/IdentityCreateTransition',
);

const ValidationResult = require('../../../../../lib/validation/ValidationResult');

describe('validateIdentityCreateTransitionStructureFactory', () => {
  let validateIdentityCreateST;
  let rawStateTransition;
  let stateTransition;
  let validatePublicKeysMock;

  beforeEach(function beforeEach() {
    validatePublicKeysMock = this.sinonSandbox.stub().returns(new ValidationResult());

    validateIdentityCreateST = validateIdentityCreateTransitionStructureFactory(
      validatePublicKeysMock,
    );

    stateTransition = getIdentityCreateSTFixture();

    rawStateTransition = stateTransition.toJSON();
  });

  it('should pass valid raw state transition', () => {
    const result = validateIdentityCreateST(rawStateTransition);

    expect(result.isValid()).to.be.true();

    expect(validatePublicKeysMock).to.be.calledOnceWithExactly(
      rawStateTransition.publicKeys,
    );
  });

  it('should pass valid state transition', () => {
    const result = validateIdentityCreateST(new IdentityCreateTransition(rawStateTransition));

    expect(result.isValid()).to.be.true();

    expect(validatePublicKeysMock).to.be.calledOnceWithExactly(
      rawStateTransition.publicKeys,
    );
  });
});
