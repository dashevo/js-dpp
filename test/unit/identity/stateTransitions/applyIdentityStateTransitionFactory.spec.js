const Identity = require('../../../../lib/identity/Identity');

const applyIdentityStateTransitionFactory = require('../../../../lib/identity/stateTransitions/applyIdentityStateTransitionFactory');

const getIdentityCreateSTFixture = require('../../../../lib/test/fixtures/getIdentityCreateSTFixture');

const IdentityAlreadyExistsError = require('../../../../lib/errors/IdentityAlreadyExistsError');
const WrongStateTransitionTypeError = require(
  '../../../../lib/stateTransition/errors/WrongStateTransitionTypeError',
);

const { convertSatoshiToCredits } = require('../../../../lib/identity/creditsConverter');
const calculateStateTransitionFee = require('../../../../lib/stateTransition/calculateStateTransitionFee');

describe('applyIdentityStateTransitionFactory', () => {
  let createStateTransition;
  let applyIdentityStateTransition;
  let getLockedTransactionOutputMock;
  let output;

  beforeEach(function beforeEach() {
    output = {
      satoshi: 10000,
    };

    getLockedTransactionOutputMock = this.sinonSandbox.stub().resolves(output);

    createStateTransition = getIdentityCreateSTFixture();
    applyIdentityStateTransition = applyIdentityStateTransitionFactory(
      getLockedTransactionOutputMock,
    );
  });

  describe('Identity Create', () => {
    it('should throw an error if identity is already present', async () => {
      const identity = new Identity();

      try {
        await applyIdentityStateTransition(createStateTransition, identity);

        expect.fail('error was not thrown');
      } catch (e) {
        expect(e).to.be.an.instanceOf(IdentityAlreadyExistsError);
        expect(e.getStateTransition()).to.equal(createStateTransition);
      }
    });

    it('should set proper data from state transition', async () => {
      const identity = await applyIdentityStateTransition(createStateTransition, null);

      const balance = convertSatoshiToCredits(output.satoshi)
        - calculateStateTransitionFee(createStateTransition);

      expect(getLockedTransactionOutputMock).to.be.calledOnceWithExactly(
        createStateTransition.getLockedOutPoint(),
      );
      expect(identity.getId()).to.equal(createStateTransition.getIdentityId());
      expect(identity.getPublicKeys()).to.deep.equal(createStateTransition.getPublicKeys());
      expect(identity.getBalance()).to.equal(balance);
    });
  });

  it('should throw an error if state transition is of wrong type', async function it() {
    this.sinonSandbox.stub(createStateTransition, 'getType').returns(42);

    try {
      await applyIdentityStateTransition(createStateTransition, null);

      expect.fail('error was not thrown');
    } catch (e) {
      expect(e).to.be.an.instanceOf(WrongStateTransitionTypeError);
      expect(e.getStateTransition()).to.equal(createStateTransition);
    }
  });
});
