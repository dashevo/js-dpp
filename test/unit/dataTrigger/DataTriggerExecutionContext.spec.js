const DataTriggerExecutionContext = require('../../../lib/dataTrigger/DataTriggerExecutionContext');
const createDataProviderMock = require('../../../lib/test/mocks/createDataProviderMock');
const getDpnsContractFixture = require('../../../lib/test/fixtures/getDpnsContractFixture');

describe('DataTriggerExecutionContext', () => {
  let dataContractMock;
  let dataProviderMock;

  beforeEach(function beforeEach() {
    dataContractMock = getDpnsContractFixture();
    dataProviderMock = createDataProviderMock(this.sinonSandbox);
  });

  it('should have all getters working', () => {
    const ownerId = 'owner_id';
    const context = new DataTriggerExecutionContext(
      dataProviderMock, ownerId, dataContractMock,
    );

    expect(context.getDataContract()).to.be.deep.equal(dataContractMock);
    expect(context.getDataProvider()).to.be.deep.equal(dataProviderMock);
    expect(context.getOwnerId()).to.be.deep.equal(ownerId);
  });
});
