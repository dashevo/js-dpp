const Document = require('../../../../lib/document/Document');
const DataTrigger = require('../../../../lib/dataTrigger/DataTrigger');
const DataTriggerExecutionResult = require('../../../../lib/dataTrigger/DataTriggerExecutionResult');
const DataTriggerExecutionContext = require('../../../../lib/dataTrigger/DataTriggerExecutionContext');
const getDpnsContractFixture = require('../../../../lib/test/fixtures/getDpnsContractFixture');
const dpnsDocumentFixture = require('../../../../lib/test/fixtures/getDpnsDocumentFixture');
const getDocumentsFixture = require('../../../../lib/test/fixtures/getDocumentsFixture');
const createDataProviderMock = require('../../../../lib/test/mocks/createDataProviderMock');

const dpnsCreateDomainDataTrigger = require('../../../../lib/dataTrigger/dpnsTriggers/createDomainDataTrigger');
const dpnsDeleteDomainDataTrigger = require('../../../../lib/dataTrigger/dpnsTriggers/createDomainDataTrigger');
const dpnsUpdateDomainDataTrigger = require('../../../../lib/dataTrigger/dpnsTriggers/createDomainDataTrigger');

const executeDataTriggers = require('../../../../lib/stPacket/verification/executeDataTriggers');

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
  let dpnsUpdateDomainDataTriggerMock;
  let dpnsDeleteDomainDataTriggerMock;
  let getDataTriggersMock;

  beforeEach(function beforeEach() {
    contractMock = getDpnsContractFixture();

    childDocument = dpnsDocumentFixture.getChildDocumentFixture();
    parentDocument = dpnsDocumentFixture.getParentDocumentFixture();

    dpnsCreateDomainDataTriggerMock = { execute: this.sinonSandbox.stub() };
    dpnsUpdateDomainDataTriggerMock = { execute: this.sinonSandbox.stub() };
    dpnsDeleteDomainDataTriggerMock = { execute: this.sinonSandbox.stub() };

    dpnsCreateDomainDataTriggerMock
      .execute.resolves(new DataTriggerExecutionResult());

    dpnsUpdateDomainDataTriggerMock
      .execute.resolves(new DataTriggerExecutionResult());

    dpnsDeleteDomainDataTriggerMock
      .execute.resolves(new DataTriggerExecutionResult());

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

    getDataTriggersMock = this.sinonSandbox.stub();

    getDataTriggersMock.returns([
      dpnsCreateDomainDataTriggerMock,
    ]);
  });

  it('should return an array of DataTriggerExecutionResult', async () => {
    const dataTriggerExecutionResults = await executeDataTriggers(
      documents, context, getDataTriggersMock,
    );

    expect(dataTriggerExecutionResults).to.have.a.lengthOf(1);

    const [result] = dataTriggerExecutionResults;

    expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    expect(result.getErrors()).to.have.a.lengthOf(0);
    expect(result.isOk()).to.be.true();
  });

  it('should execute multiple data triggers if there is more than one data trigger for'
    + ' the same document and action in the contract', async () => {
    getDataTriggersMock.returns([
      dpnsCreateDomainDataTriggerMock,
      dpnsCreateDomainDataTriggerMock,
      dpnsCreateDomainDataTriggerMock,
    ]);

    const expectedTriggersCount = 3;
    expect(dpnsTriggers.length).to.equal(expectedTriggersCount);

    const dataTriggerExecutionResults = await executeDataTriggers(
      documents, context, getDataTriggersMock,
    );

    expect(dataTriggerExecutionResults).to.have.a.lengthOf(expectedTriggersCount);

    dataTriggerExecutionResults.forEach((dataTriggerExecutionResult) => {
      expect(dataTriggerExecutionResult.getErrors()).to.have.a.lengthOf(0);
    });
  });

  it('should return a result for each passed document with success or error', async function test() {
    const doc1 = getDocumentsFixture()[0];
    const doc2 = getDocumentsFixture()[1];

    documents = [doc1, doc2, doc1];

    const passingExecutionResult = new DataTriggerExecutionResult();
    const executionResultWithErrors = new DataTriggerExecutionResult();

    executionResultWithErrors.addError(new Error('Trigger error'));

    const passingTriggerMockFunction = this.sinonSandbox.stub()
      .resolves(passingExecutionResult);
    const throwingTriggerMockFunction = this.sinonSandbox.stub()
      .resolves(executionResultWithErrors);

    const passingDataTriggerMock = new DataTrigger(
      contractMock.getId(),
      doc1.getType(),
      doc1.getAction(),
      passingTriggerMockFunction,
    );

    const throwingDataTriggerMock = new DataTrigger(
      contractMock.getId(),
      doc2.getType(),
      doc2.getAction(),
      throwingTriggerMockFunction,
    );

    getDataTriggersMock
      .withArgs(contractMock.getId(), doc1.getType(), doc1.getAction())
      .returns([passingDataTriggerMock]);

    getDataTriggersMock
      .withArgs(contractMock.getId(), doc2.getType(), doc2.getAction())
      .returns([throwingDataTriggerMock]);

    context = new DataTriggerExecutionContext(
      dataProviderMock, 'id', contractMock, stateTransitionHeaderMock,
    );

    const dataTriggerExecutionResults = await executeDataTriggers(
      documents, context, getDataTriggersMock,
    );

    const expectedResultsCount = 3;

    expect(documents.length).to.equal(expectedResultsCount);
    expect(dataTriggerExecutionResults.length).to.equal(expectedResultsCount);

    const passingResults = dataTriggerExecutionResults.filter(result => result.isOk());
    const failingResults = dataTriggerExecutionResults.filter(result => !result.isOk());

    expect(passingResults).to.have.a.lengthOf(2);
    expect(failingResults).to.have.a.lengthOf(1);

    expect(failingResults[0].getErrors()).to.have.a.lengthOf(1);
    expect(failingResults[0].getErrors()[0].message).to
      .equal('Trigger error');

    expect(passingTriggerMockFunction.callCount).to.equal(2);
    expect(throwingTriggerMockFunction.callCount).to.equal(1);
  });

  it("should not call any triggers if documents have no triggers associated with it's type or action", async () => {
    getDataTriggersMock
      .withArgs(contractMock.getId(), domainDocumentType, Document.ACTIONS.CREATE)
      .returns([])
      .withArgs(contractMock.getId(), domainDocumentType, Document.ACTIONS.DELETE)
      .returns([dpnsDeleteDomainDataTriggerMock])
      .withArgs(contractMock.getId(), domainDocumentType, Document.ACTIONS.UPDATE)
      .returns([dpnsUpdateDomainDataTriggerMock]);

    await executeDataTriggers(documents, context, getDataTriggersMock);

    expect(dpnsDeleteDomainDataTriggerMock.execute).not.to.be.called();
    expect(dpnsUpdateDomainDataTriggerMock.execute).not.to.be.called();
  });

  it("should call only one trigger if there's one document with a trigger and one without", async () => {
    documents = [childDocument].concat(getDocumentsFixture());

    getDataTriggersMock.resetBehavior();
    getDataTriggersMock
      .returns([])
      .withArgs(contractMock.getId(), domainDocumentType, Document.ACTIONS.CREATE)
      .returns([dpnsCreateDomainDataTriggerMock])
      .withArgs(contractMock.getId(), domainDocumentType, Document.ACTIONS.DELETE)
      .returns([dpnsDeleteDomainDataTriggerMock])
      .withArgs(contractMock.getId(), domainDocumentType, Document.ACTIONS.UPDATE)
      .returns([dpnsUpdateDomainDataTriggerMock]);

    await executeDataTriggers(documents, context, getDataTriggersMock);

    expect(dpnsCreateDomainDataTriggerMock.execute).to.be.calledOnce();
    expect(dpnsDeleteDomainDataTriggerMock.execute).not.to.be.called();
    expect(dpnsUpdateDomainDataTriggerMock.execute).not.to.be.called();
  });

  it("should not call any triggers if there's no triggers in the contract", async () => {
    documents = getDocumentsFixture();

    getDataTriggersMock.resetBehavior();
    getDataTriggersMock
      .returns([])
      .withArgs(contractMock.getId(), domainDocumentType, Document.ACTIONS.CREATE)
      .returns([dpnsCreateDomainDataTriggerMock])
      .withArgs(contractMock.getId(), domainDocumentType, Document.ACTIONS.DELETE)
      .returns([dpnsDeleteDomainDataTriggerMock])
      .withArgs(contractMock.getId(), domainDocumentType, Document.ACTIONS.UPDATE)
      .returns([dpnsUpdateDomainDataTriggerMock]);

    await executeDataTriggers(documents, context, getDataTriggersMock);

    expect(dpnsCreateDomainDataTriggerMock.execute).not.to.be.called();
    expect(dpnsDeleteDomainDataTriggerMock.execute).not.to.be.called();
    expect(dpnsUpdateDomainDataTriggerMock.execute).not.to.be.called();
  });
});
