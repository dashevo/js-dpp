const getIdentityTopUpSTFixture = require('../../../../../lib/test/fixtures/getIdentityTopUpSTFixture');

const validateIdentityTopUpSTStructureFactory = require(
  '../../../../../lib/identity/stateTransitions/identityTopUpTransition/validateIdentityTopUpTransitionStructureFactory',
);

const IdentityTopUpTransition = require(
  '../../../../../lib/identity/stateTransitions/identityTopUpTransition/IdentityTopUpTransition',
);

describe('validateIdentityTopUpTransitionStructureFactory', () => {
  let validateIdentityTopUpST;
  let rawStateTransition;
  let stateTransition;

  beforeEach(function beforeEach() {
    validateIdentityTopUpST = validateIdentityTopUpSTStructureFactory();

    stateTransition = getIdentityTopUpSTFixture();

    rawStateTransition = stateTransition.toJSON();
  });

  it('should pass valid raw state transition', () => {
    const result = validateIdentityTopUpST(rawStateTransition);

    expect(result.isValid()).to.be.true();
  });

  it('should pass valid state transition', () => {
    const result = validateIdentityTopUpST(new IdentityTopUpTransition(rawStateTransition));

    expect(result.isValid()).to.be.true();
  });
});
