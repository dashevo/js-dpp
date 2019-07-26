const Document = require('../../../lib/document/Document');
const DataTriggerExecutionResult = require('../../../lib/dataTrigger/DataTriggerExecutionResult');
const DataTriggerExecutionContext = require('../../../lib/dataTrigger/DataTriggerExecutionContext');
const getDpnsContractFixture = require('../../../lib/test/fixtures/getDpnsContractFixture');
const dpnsDocumentFixture = require('../../../lib/test/fixtures/getDpnsDocumentFixture');
const createDataProviderMock = require('../../../lib/test/mocks/createDataProviderMock');
const executeDataTriggers = require('../../../lib/dataTrigger/executeDataTriggers');

const dpnsCreateDomainDataTrigger = require('../../../lib/dataTrigger/dpnsTriggers/createDomainDataTrigger');
const dpnsDeleteDomainDataTrigger = require('../../../lib/dataTrigger/dpnsTriggers/createDomainDataTrigger');
const dpnsUpdateDomainDataTrigger = require('../../../lib/dataTrigger/dpnsTriggers/createDomainDataTrigger');

describe('executeDataTriggers', () => {
  let parentDocument;
  let childDocument;
  let dataProviderMock;
  let contract;
  const dpnsTriggers = [
    dpnsCreateDomainDataTrigger,
    dpnsDeleteDomainDataTrigger,
    dpnsUpdateDomainDataTrigger,
  ];
  const domainDocumentType = 'domain';
  let stateTransitionHeaderMock;

  beforeEach(function beforeEach() {
    contract = getDpnsContractFixture();
    this.sinonSandbox.stub(contract, 'getDataTriggers')
      .withArgs()
      .returns(dpnsTriggers)
      .withArgs(domainDocumentType, Document.ACTIONS.CREATE)
      .returns([dpnsCreateDomainDataTrigger])
      .withArgs(domainDocumentType, Document.ACTIONS.DELETE)
      .returns([dpnsDeleteDomainDataTrigger])
      .withArgs(domainDocumentType, Document.ACTIONS.UPDATE)
      .returns([dpnsUpdateDomainDataTrigger]);
    childDocument = dpnsDocumentFixture.getChildDocumentFixture();
    parentDocument = dpnsDocumentFixture.getParentDocumentFixture();

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
  });

  afterEach(() => {
    contract.getDataTriggers.restore();
  });

  it('should return an array of DataTriggerExecutionResult', async () => {
    const documents = [childDocument];
    const userId = 'userId';
    const context = new DataTriggerExecutionContext(
      dataProviderMock, userId, contract, stateTransitionHeaderMock,
    );
    const dataTriggerExecutionResults = await executeDataTriggers(documents, context);

    expect(dataTriggerExecutionResults).to.be.an('array');
    expect(dataTriggerExecutionResults.length).to.be.equal(1);
    expect(dataTriggerExecutionResults[0]).to.be.an.instanceOf(DataTriggerExecutionResult);

    const [result] = dataTriggerExecutionResults;

    expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    expect(result.getErrors()).to.be.an('array');
    expect(result.getErrors().length).to.be.equal(0);
    expect(result.isOk()).is.true();
  });

  it('Should execute multiple data triggers if there is more than one data trigger for'
    + ' the same document and action in the contract', async () => {
    throw new Error('Not implemented');
  });
  it('Should return a result for each passed document with success or error', async () => {
    throw new Error('Not implemented');
  });
});
