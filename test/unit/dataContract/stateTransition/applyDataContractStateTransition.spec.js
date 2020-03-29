const DataContractCreateTransition = require(
  '../../../../lib/dataContract/stateTransition/DataContractCreateTransition',
);

const WrongStateTransitionTypeError = require('../../../../lib/dataContract/errors/WrongStateTransitionTypeError');
const DataContractAlreadyExistsError = require('../../../../lib/dataContract/errors/DataContractAlreadyExistsError');

const getDataContractFixture = require('../../../../lib/test/fixtures/getDataContractFixture');

const applyDataContractStateTransition = require(
  '../../../../lib/dataContract/stateTransition/applyDataContractStateTransition',
);

describe('applyDataContractStateTransition', () => {
  let stateTransition;
  let dataContract;

  beforeEach(() => {
    dataContract = getDataContractFixture();

    stateTransition = new DataContractCreateTransition({
      dataContract: dataContract.toJSON(),
    });
  });

  it('should throw an error if data contract already exists', () => {
    try {
      applyDataContractStateTransition(stateTransition, dataContract);
    } catch (e) {
      expect(e).to.be.an.instanceOf(DataContractAlreadyExistsError);
      expect(e.getStateTransition()).to.deep.equal(stateTransition);
    }
  });

  it('should throw an error if state transition type is not known', () => {
    stateTransition.type = 4;
    try {
      applyDataContractStateTransition(stateTransition, undefined);
    } catch (e) {
      expect(e).to.be.an.instanceOf(WrongStateTransitionTypeError);
      expect(e.getStateTransition()).to.deep.equal(stateTransition);
    }
  });

  it('should return newly create data contract', () => {
    const result = applyDataContractStateTransition(stateTransition, undefined);

    expect(result.toJSON()).to.deep.equal(dataContract.toJSON());
  });
});
