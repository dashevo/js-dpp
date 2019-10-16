const DashPlatformProtocol = require('../../../lib/DashPlatformProtocol');

const DataContractStateTransition = require('../../../lib/dataContract/stateTransition/DataContractStateTransition');

const ValidationResult = require('../../../lib/validation/ValidationResult');

const getDataContractFixture = require('../../../lib/test/fixtures/getDataContractFixture');

const createDataProviderMock = require('../../../lib/test/mocks/createDataProviderMock');

describe('StateTransition', () => {
  let dpp;
  let dataContract;
  let stateTransition;

  beforeEach(function beforeEach() {
    dpp = new DashPlatformProtocol({
      dataProvider: createDataProviderMock(this.sinonSandbox),
    });

    dataContract = getDataContractFixture();
    stateTransition = new DataContractStateTransition(dataContract);
  });

  describe('createFromObject', () => {
    it('should create State Transition from plain object', () => {
      const result = dpp.stateTransition.createFromObject(stateTransition.toJSON());

      expect(result).to.be.an.instanceOf(DataContractStateTransition);

      expect(result.toJSON()).to.deep.equal(stateTransition.toJSON());
    });
  });

  describe('createFromSerialized', () => {
    it('should create State Transition from string', () => {
      const result = dpp.stateTransition.createFromSerialized(stateTransition.serialize());

      expect(result).to.be.an.instanceOf(DataContractStateTransition);

      expect(result.toJSON()).to.deep.equal(stateTransition.toJSON());
    });
  });

  describe('validate', () => {
    it('should validate State Transition', async () => {
      const result = await dpp.stateTransition.validate(stateTransition.toJSON());

      expect(result).to.be.an.instanceOf(ValidationResult);
    });

    it('should validate only data if skipStructureValidation is passed', async function it() {
      const validateStructureSpy = this.sinonSandbox.spy(
        dpp.stateTransition,
        'validateStateTransitionStructure',
      );

      const result = await dpp.stateTransition.validate(
        stateTransition,
        { skipStructureValidation: true },
      );

      expect(result).to.be.an.instanceOf(ValidationResult);

      expect(validateStructureSpy).to.not.be.called();
    });
  });
});
