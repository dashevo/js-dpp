const validateDataContractSTDataFactory = require('../../../../../lib/dataContract/stateTransition/validation/validateDataContractSTDataFactory');
const DataContractCreateTransition = require('../../../../../lib/dataContract/stateTransition/DataContractCreateTransition');


const createDataProviderMock = require('../../../../../lib/test/mocks/createDataProviderMock');
const getDataContractFixture = require('../../../../../lib/test/fixtures/getDataContractFixture');

const { expectValidationError } = require('../../../../../lib/test/expect/expectError');

const ValidationResult = require('../../../../../lib/validation/ValidationResult');

const DataContractAlreadyPresentError = require('../../../../../lib/errors/DataContractAlreadyPresentError');

describe('validateDataContractSTDataFactory', () => {
  let validateDataContractSTData;
  let dataContract;
  let stateTransition;
  let dataProviderMock;

  beforeEach(function beforeEach() {
    dataProviderMock = createDataProviderMock(this.sinonSandbox);


    dataContract = getDataContractFixture();
    stateTransition = new DataContractCreateTransition({
      dataContract: dataContract.toJSON(),
    });

    validateDataContractSTData = validateDataContractSTDataFactory(
      dataProviderMock,
    );
  });

  it('should return invalid result if Data Contract with specified contractId is already exist', async () => {
    dataProviderMock.fetchDataContract.resolves(dataContract);

    const result = await validateDataContractSTData(stateTransition);

    expectValidationError(result, DataContractAlreadyPresentError);

    const [error] = result.getErrors();

    expect(error.getDataContract().toJSON()).to.deep.equal(dataContract.toJSON());

    expect(dataProviderMock.fetchDataContract).to.be.calledOnceWithExactly(dataContract.getId());
  });

  it('should return valid result', async () => {
    const result = await validateDataContractSTData(stateTransition);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();

    expect(dataProviderMock.fetchDataContract).to.be.calledOnceWithExactly(dataContract.getId());
  });
});
