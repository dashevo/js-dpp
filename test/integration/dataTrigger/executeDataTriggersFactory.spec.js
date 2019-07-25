const Document = require('../../../lib/document/Document');
const DataTriggerExecutionResult = require('../../../lib/dataTrigger/DataTriggerExecutionResult');
const DataTriggerExecutionError = require('../../../lib/errors/DataTriggerExecutionError');
const DataTriggerExecutionContext = require('../../../lib/dataTrigger/DataTriggerExecutionContext');
const getDpnsContractFixture = require('../../../lib/test/fixtures/getDpnsContractFixture');
const dpnsDocumentFixture = require('../../../lib/test/fixtures/getDpnsDocumentFixture');
const createDataProviderMock = require('../../../lib/test/mocks/createDataProviderMock');
const executeDataTriggersFactory = require('../../../lib/dataTrigger/executeDataTriggersFactory');

const dpnsCreateDomainDataTrigger = require('../../../lib/dataTrigger/dpnsTriggers/domainCreateDataTrigger');
const dpnsDeleteDomainDataTrigger = require('../../../lib/dataTrigger/dpnsTriggers/domainCreateDataTrigger');
const dpnsUpdateDomainDataTrigger = require('../../../lib/dataTrigger/dpnsTriggers/domainCreateDataTrigger');

describe('domainDataTrigger', () => {
  let parentDocument;
  let childDocument;
  let context;
  let dataProviderMock;
  let contract;
  const dpnsTriggers = [
    dpnsCreateDomainDataTrigger,
    dpnsDeleteDomainDataTrigger,
    dpnsUpdateDomainDataTrigger,
  ];
  const domainDocumentType = 'domain';

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

    context = new DataTriggerExecutionContext(
      dataProviderMock,
      '6b74011f5d2ad1a8d45b71b9702f54205ce75253593c3cfbba3fdadeca278288',
      contract,
    );
  });

  afterEach(() => {
    contract.getDataTriggers.restore();
  });

  it('Should work', async () => {
    const documents = [childDocument];
    const userId = 'userId';
    const dataTriggerExecutionResults = await executeDataTriggersFactory(
      documents, contract, dataProviderMock, userId,
    )();

    expect(dataTriggerExecutionResults).to.be.an('array');
    expect(dataTriggerExecutionResults.length).to.be.equal(1);
    expect(dataTriggerExecutionResults[0]).to.be.an.instanceOf(DataTriggerExecutionResult);

    const [result] = dataTriggerExecutionResults;

    expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    expect(result.getErrors()).to.be.an('array');
    expect(result.getErrors().length).to.be.equal(0);
    expect(result.isOk()).is.true();
  });

  it('Should execute both data triggers if there is two data triggers for the same document and action in the contract', async () => {
    throw new Error('Not implemented');
  });
});
