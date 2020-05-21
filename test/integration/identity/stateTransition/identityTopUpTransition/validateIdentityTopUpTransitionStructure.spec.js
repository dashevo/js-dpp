const getIdentityTopUpSTFixture = require('../../../../../lib/test/fixtures/getIdentityTopUpSTFixture');

const validateIdentityTopUpTransitionStructure = require(
  '../../../../../lib/identity/stateTransitions/identityTopUpTransition/validateIdentityTopUpTransitionStructure',
);

const IdentityTopUpTransition = require(
  '../../../../../lib/identity/stateTransitions/identityTopUpTransition/IdentityTopUpTransition',
);

describe('validateIdentityTopUpTransitionStructure', () => {
  let rawStateTransition;
  let stateTransition;

  beforeEach(() => {
    stateTransition = getIdentityTopUpSTFixture();

    rawStateTransition = stateTransition.toJSON();
  });

  it('should pass valid raw state transition', () => {
    const result = validateIdentityTopUpTransitionStructure(rawStateTransition);

    expect(result.isValid()).to.be.true();
  });

  it('should pass valid state transition', () => {
    const result = validateIdentityTopUpTransitionStructure(
      new IdentityTopUpTransition(rawStateTransition),
    );

    expect(result.isValid()).to.be.true();
  });
});
