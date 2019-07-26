const Document = require('../../../lib/document/Document');
const DataTriggerExecutionResult = require('../../../lib/dataTrigger/DataTriggerExecutionResult');
const DataTriggerExecutionContext = require('../../../lib/dataTrigger/DataTriggerExecutionContext');
const getDpnsContractFixture = require('../../../lib/test/fixtures/getDpnsContractFixture');
const dpnsDocumentFixture = require('../../../lib/test/fixtures/getDpnsDocumentFixture');
const getDocumentsFixture = require('../../../lib/test/fixtures/getDocumentsFixture');
const createDataProviderMock = require('../../../lib/test/mocks/createDataProviderMock');
const executeDataTriggers = require('../../../lib/dataTrigger/executeDataTriggers');

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
    dpnsCreateDomainDataTriggerMock = this.sinonSandbox.stub().returns({ execute: this.sinonSandbox.stub() });
    dpnsDeleteDomainDataTriggerMock = this.sinonSandbox.stub();
    dpnsUpdateDomainDataTriggerMock = this.sinonSandbox.stub();
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

    const dataTriggerExecutionResults = await executeDataTriggers(documents, context);
    expect(dataTriggerExecutionResults).to.be.an('array');
    expect(dataTriggerExecutionResults.length).to.be.equal(dpnsTriggers.length);

    dataTriggerExecutionResults.forEach((dataTriggerExecutionResult) => {
      expect(dataTriggerExecutionResult.errors).to.be.an('array');
      expect(dataTriggerExecutionResult.errors.length).to.equal(0);
    });
  });

  it('should return a result for each passed document with success or error', async () => {
    const dataTriggerExecutionResults = await executeDataTriggers(documents, context);

    dataTriggerExecutionResults.forEach((dataTriggerExecutionResult) => {
      expect(dataTriggerExecutionResult.isOk()).to.be.true();
    });
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

    expect(dpnsDeleteDomainDataTriggerMock).not.to.be.called();
    expect(dpnsUpdateDomainDataTriggerMock).not.to.be.called();
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

    expect(dpnsCreateDomainDataTriggerMock).to.be.calledOnce();
    expect(dpnsDeleteDomainDataTriggerMock).not.to.be.called();
    expect(dpnsUpdateDomainDataTriggerMock).not.to.be.called();
  });

  it('should return results for all the documents, whether they are any errors or not', async () => {
    throw new Error('Not Implemented');
  });
  it("should call any triggers if there's no triggers in the contract", async () => {
    throw new Error('Not Implemented');
  });
  // TODO: more test cases:
  // There should be at least one document with no registered triggers;
  // There should two document with only one registered trigger:
  //   - One document that fails the trigger;
  //   - One document that passes the trigger;
  // There should be three documents with at least two data triggers:
  //   - One document passes all triggers
  //   - One document that passes one trigger and fails another
  //   - One document that fails both data triggers
  //   - One document that fails one of the triggers, but more than with one error
});
