const Document = require('../../../lib/document/Document');
const DataTrigger = require('../../../lib/dataTrigger/DataTrigger');
const DataTriggerExecutionResult = require('../../../lib/dataTrigger/DataTriggerExecutionResult');
const DataTriggerExecutionContext = require('../../../lib/dataTrigger/DataTriggerExecutionContext');
const getDpnsContractFixture = require('../../../lib/test/fixtures/getDpnsContractFixture');
const dpnsDocumentFixture = require('../../../lib/test/fixtures/getDpnsDocumentFixture');
const getDocumentsFixture = require('../../../lib/test/fixtures/getDocumentsFixture');
const createDataProviderMock = require('../../../lib/test/mocks/createDataProviderMock');
const executeDataTriggers = require('../../../lib/stPacket/executeDataTriggers');

const dpnsCreateDomainDataTrigger = require('../../../lib/dataTrigger/dpnsTriggers/createDomainDataTrigger');
const dpnsDeleteDomainDataTrigger = require('../../../lib/dataTrigger/dpnsTriggers/createDomainDataTrigger');
const dpnsUpdateDomainDataTrigger = require('../../../lib/dataTrigger/dpnsTriggers/createDomainDataTrigger');

describe('executeDataTriggers', () => {
  let parentDocument;
  let childDocument;
  let dataProviderMock;
  let contractMock;
  const dpnsTriggers = [
    dpnsCreateDomainDataTrigger,
    dpnsDeleteDomainDataTrigger,
    dpnsUpdateDomainDataTrigger,
  ];
  const domainDocumentType = 'domain';
  let stateTransitionHeaderMock;
  let context;
  let documents;
  let dpnsCreateDomainDataTriggerMock;
  let dpnsDeleteDomainDataTriggerMock;
  let dpnsUpdateDomainDataTriggerMock;

  beforeEach(function beforeEach() {
    contractMock = getDpnsContractFixture();
    this.sinonSandbox.stub(contractMock, 'getDataTriggers')
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
        contractMock.getId(),
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
    const userId = 'userId';
    context = new DataTriggerExecutionContext(
      dataProviderMock, userId, contractMock, stateTransitionHeaderMock,
    );
    documents = [childDocument];
    dpnsCreateDomainDataTriggerMock = { execute: this.sinonSandbox.stub() };
    dpnsDeleteDomainDataTriggerMock = { execute: this.sinonSandbox.stub() };
    dpnsUpdateDomainDataTriggerMock = { execute: this.sinonSandbox.stub() };
  });

  afterEach(() => {
    contractMock.getDataTriggers.restore();
  });

  it('should return an array of DataTriggerExecutionResult', async () => {
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

  it('should execute multiple data triggers if there is more than one data trigger for'
    + ' the same document and action in the contract', async () => {
    contractMock.getDataTriggers
      .withArgs(domainDocumentType, Document.ACTIONS.CREATE)
      .returns(dpnsTriggers);

    const expectedTriggersCount = 3;
    expect(dpnsTriggers.length).to.be.equal(expectedTriggersCount);

    const dataTriggerExecutionResults = await executeDataTriggers(documents, context);
    expect(dataTriggerExecutionResults).to.be.an('array');
    expect(dataTriggerExecutionResults.length).to.be.equal(expectedTriggersCount);

    dataTriggerExecutionResults.forEach((dataTriggerExecutionResult) => {
      expect(dataTriggerExecutionResult.errors).to.be.an('array');
      expect(dataTriggerExecutionResult.errors.length).to.equal(0);
    });
  });

  it('should return a result for each passed document with success or error', async function test() {
    const doc1 = getDocumentsFixture()[0];
    const doc2 = getDocumentsFixture()[1];
    documents = [doc1, doc2, doc1];
    const passingTriggerMockFunction = this.sinonSandbox.stub().resolves(true);
    const throwingTriggerMockFunction = this.sinonSandbox.stub().resolves(false);
    const passingDataTriggerMock = new DataTrigger(
      doc1.getType(),
      doc1.getAction(),
      passingTriggerMockFunction,
    );
    const throwingDataTriggerMock = new DataTrigger(
      doc2.getType(),
      doc2.getAction(),
      throwingTriggerMockFunction,
    );
    contractMock.getDataTriggers.resetBehavior();
    contractMock.getDataTriggers
      .withArgs(doc1.getType(), doc1.getAction())
      .returns([passingDataTriggerMock])
      .withArgs(doc2.getType(), doc2.getAction())
      .returns([throwingDataTriggerMock]);
    context = new DataTriggerExecutionContext(dataProviderMock, 'id', contractMock, stateTransitionHeaderMock);
    const dataTriggerExecutionResults = await executeDataTriggers(documents, context);

    const expectedResultsCount = 3;
    expect(documents.length).to.be.equal(expectedResultsCount);
    expect(dataTriggerExecutionResults.length).to.be.equal(expectedResultsCount);

    const passingResults = dataTriggerExecutionResults.filter(result => result.isOk());
    const failingResults = dataTriggerExecutionResults.filter(result => !result.isOk());

    expect(passingResults.length).to.be.equal(2);
    expect(failingResults.length).to.be.equal(1);
    expect(failingResults[0].getErrors().length).to.be.equal(1);
    expect(failingResults[0].getErrors()[0].getDocument()).to.be.deep.equal(doc2);

    expect(passingTriggerMockFunction.callCount).to.be.equal(2);
    expect(throwingTriggerMockFunction.callCount).to.be.equal(1);
  });

  it("should not call any triggers if documents have no triggers associated with it's type or action", async () => {
    contractMock.getDataTriggers
      .withArgs(domainDocumentType, Document.ACTIONS.CREATE)
      .returns([])
      .withArgs(domainDocumentType, Document.ACTIONS.DELETE)
      .returns([dpnsDeleteDomainDataTriggerMock])
      .withArgs(domainDocumentType, Document.ACTIONS.UPDATE)
      .returns([dpnsUpdateDomainDataTriggerMock]);

    await executeDataTriggers(documents, context);

    expect(dpnsDeleteDomainDataTriggerMock.execute).not.to.be.called();
    expect(dpnsUpdateDomainDataTriggerMock.execute).not.to.be.called();
  });

  it("should call only one trigger if there's one document with a trigger and one without", async () => {
    documents = [childDocument].concat(getDocumentsFixture());
    contractMock.getDataTriggers
      .withArgs(domainDocumentType, Document.ACTIONS.CREATE)
      .returns([dpnsCreateDomainDataTriggerMock])
      .withArgs(domainDocumentType, Document.ACTIONS.DELETE)
      .returns([dpnsDeleteDomainDataTriggerMock])
      .withArgs(domainDocumentType, Document.ACTIONS.UPDATE)
      .returns([dpnsUpdateDomainDataTriggerMock]);

    await executeDataTriggers(documents, context);

    expect(dpnsCreateDomainDataTriggerMock.execute).to.be.calledOnce();
    expect(dpnsDeleteDomainDataTriggerMock.execute).not.to.be.called();
    expect(dpnsUpdateDomainDataTriggerMock.execute).not.to.be.called();
  });

  it("should not call any triggers if there's no triggers in the contract", async () => {
    documents = getDocumentsFixture();
    contractMock.getDataTriggers
      .withArgs(domainDocumentType, Document.ACTIONS.CREATE)
      .returns([dpnsCreateDomainDataTriggerMock])
      .withArgs(domainDocumentType, Document.ACTIONS.DELETE)
      .returns([dpnsDeleteDomainDataTriggerMock])
      .withArgs(domainDocumentType, Document.ACTIONS.UPDATE)
      .returns([dpnsUpdateDomainDataTriggerMock]);

    await executeDataTriggers(documents, context);

    expect(dpnsCreateDomainDataTriggerMock.execute).not.to.be.called();
    expect(dpnsDeleteDomainDataTriggerMock.execute).not.to.be.called();
    expect(dpnsUpdateDomainDataTriggerMock.execute).not.to.be.called();
  });
});
