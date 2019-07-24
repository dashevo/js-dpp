const DataTriggerExecutionResult = require('../../../lib/dataTrigger/DataTriggerExecutionResult');
const DataTriggerExecutionError = require('../../../lib/errors/DataTriggerExecutionError');
const DataTriggerExecutionContext = require('../../../lib/dataTrigger/DataTriggerExecutionContext');
const getDpnsContractFixture = require('../../../lib/test/fixtures/getDpnsContractFixture');
const createDataProviderMock = require('../../../lib/test/mocks/createDataProviderMock');
const executeDataTriggersFactory = require('../../../lib/dataTrigger/executeDataTriggersFactory');

describe('domainDataTrigger', () => {
  let parentDocument;
  let childDocument;
  let context;
  let dataProviderMock;
  let contract;

  beforeEach(function beforeEach() {
    contract = getDpnsContractFixture();

    dataProviderMock = createDataProviderMock(this.sinonSandbox);
    dataProviderMock.fetchDocuments.resolves([]);
    dataProviderMock.fetchDocuments
      .withArgs(
        contract.getId(),
        childDocument.getType(),
        { where: ['hash', '==', childDocument.getData().parentDomainHash] },
      )
      .resolves([parentDocument.toJSON()]);
    dataProviderMock.fetchTransaction.resolves(null);
    dataProviderMock.fetchTransaction
      .withArgs(
        childDocument.getData().records.dashIdentity,
      )
      .resolves({ confirmations: 10 });

    context = new DataTriggerExecutionContext(
      dataProviderMock,
      '6b74011f5d2ad1a8d45b71b9702f54205ce75253593c3cfbba3fdadeca278288',
      contract,
    );
  });

  it('Should work', async () => {
    let dataTriggerExecutionResults = executeDataTriggersFactory([])();
    const result = await domainDataTrigger(childDocument, context);

    expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    expect(result.getErrors()).to.be.an('array');
    expect(result.getErrors().length).to.be.equal(0);
    expect(result.isOk()).is.true();
  });
});
