const domainCreateDataTrigger = require('../../../../lib/dataTrigger/dpnsTriggers/domainCreateDataTrigger');
const DataTriggerExecutionResult = require('../../../../lib/dataTrigger/DataTriggerExecutionResult');
const DataTriggerExecutionError = require('../../../../lib/errors/DataTriggerExecutionError');
const DataTriggerExecutionContext = require('../../../../lib/dataTrigger/DataTriggerExecutionContext');
const { getParentDocumentFixture, getChildDocumentFixture } = require('../../../../lib/test/fixtures/getDpnsDocumentFixture');
const getDpnsContractFixture = require('../../../../lib/test/fixtures/getDpnsContractFixture');
const createDataProviderMock = require('../../../../lib/test/mocks/createDataProviderMock');
const Document = require('../../../../lib/document/Document');

describe('domainCreateDataTrigger', () => {
  let parentDocument;
  let childDocument;
  let context;
  let dataProviderMock;
  let contract;

  beforeEach(function beforeEach() {
    contract = getDpnsContractFixture();

    parentDocument = getParentDocumentFixture();
    childDocument = getChildDocumentFixture();

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

  it('should check result is DataTriggerExecutionResult instance and has no errors', async () => {
    const result = await domainCreateDataTrigger(childDocument, context);

    expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    expect(result.getErrors()).to.be.an('array');
    expect(result.getErrors().length).to.be.equal(0);
    expect(result.isOk()).is.true();
  });

  it('should fail with invalid hash', async () => {
    childDocument = getChildDocumentFixture({ hash: 'invalidHash' });
    dataProviderMock.fetchTransaction
      .withArgs(
        childDocument.getData().records.dashIdentity,
      )
      .resolves({ confirmations: 10 });

    const result = await domainCreateDataTrigger(childDocument, context);

    expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    expect(result.getErrors()).to.be.an('array');
    expect(result.getErrors().length).to.be.equal(1);
    expect(result.isOk()).is.false();
    expect(result.getErrors()[0]).to.be.an.instanceOf(DataTriggerExecutionError);
    expect(result.getErrors()[0].message).to.be.equal('Document hash doesn\'t match actual hash');
  });

  it('should fail with invalid normalizedLabel', async () => {
    childDocument = getChildDocumentFixture({ normalizedLabel: childDocument.getData().label });
    dataProviderMock.fetchTransaction
      .withArgs(
        childDocument.getData().records.dashIdentity,
      )
      .resolves({ confirmations: 10 });

    const result = await domainCreateDataTrigger(childDocument, context);

    expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    expect(result.getErrors()).to.be.an('array');
    expect(result.getErrors().length).to.be.equal(1);
    expect(result.isOk()).is.false();
    expect(result.getErrors()[0]).to.be.an.instanceOf(DataTriggerExecutionError);
    expect(result.getErrors()[0].message).to.be.equal('Normalized label doesn\'t match label');
  });

  it('should fail with invalid parrentDomain', async () => {
    childDocument = getChildDocumentFixture({ parentDomainHash: 'invalidHash' });
    dataProviderMock.fetchTransaction
      .withArgs(
        childDocument.getData().records.dashIdentity,
      )
      .resolves({ confirmations: 10 });

    const result = await domainCreateDataTrigger(childDocument, context);

    expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    expect(result.getErrors()).to.be.an('array');
    expect(result.getErrors().length).to.be.equal(1);
    expect(result.isOk()).is.false();
    expect(result.getErrors()[0]).to.be.an.instanceOf(DataTriggerExecutionError);
    expect(result.getErrors()[0].message).to.be.equal('Can\'t find parent domain matching parent hash');
  });

  it('should fail with invalid transaction', async () => {
    childDocument = getChildDocumentFixture({
      records: {
        dashIdentity: 'invalidHash',
      },
    });

    const result = await domainCreateDataTrigger(childDocument, context);

    expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    expect(result.getErrors()).to.be.an('array');
    expect(result.getErrors().length).to.be.equal(1);
    expect(result.isOk()).is.false();
    expect(result.getErrors()[0]).to.be.an.instanceOf(DataTriggerExecutionError);
    expect(result.getErrors()[0].message).to.be.equal('dashIdentity with corresponding id not found');
  });

  it('should fail with invalid action', async () => {
    childDocument.setAction(Document.ACTIONS.UPDATE);

    const result = await domainCreateDataTrigger(childDocument, context);

    expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    expect(result.getErrors()).to.be.an('array');
    expect(result.getErrors().length).to.be.equal(1);
    expect(result.isOk()).is.false();
    expect(result.getErrors()[0]).to.be.an.instanceOf(DataTriggerExecutionError);
    expect(result.getErrors()[0].message).to.be.equal('Document action is not create');
  });
});
