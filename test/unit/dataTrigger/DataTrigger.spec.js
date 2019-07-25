const DataTrigger = require('../../../lib/dataTrigger/DataTrigger');
const Document = require('../../../lib/document/Document');
const DataTriggerExecutionContext = require('../../../lib/dataTrigger/DataTriggerExecutionContext');
const createDataProviderMock = require('../../../lib/test/mocks/createDataProviderMock');
const getDpnsContractFixture = require('../../../lib/test/fixtures/getDpnsContractFixture');
const domainCreateDataTrigger = require('../../../lib/dataTrigger/dataTriggers/domainCreateDataTrigger');
const { getParentDocumentFixture, getChildDocumentFixture } = require('../../../lib/test/fixtures/getDpnsDocumentFixture');
const DataTriggerExecutionResult = require('../../../lib/dataTrigger/DataTriggerExecutionResult');
const getDocumentsFixture = require('../../../lib/test/fixtures/getDocumentsFixture');
const DataTriggerExecutionError = require('../../../lib/errors/DataTriggerExecutionError');

const documentType = 'domain';

describe('DataTrigger', () => {
  let contract;
  let context;
  let dataProviderMock;
  let parentDocument;
  let childDocument;

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

  it('should check trigger fields', () => {
    const trigger = new DataTrigger(documentType, Document.ACTIONS.CREATE, domainCreateDataTrigger);

    expect(trigger.documentType).to.be.equal(documentType);
    expect(trigger.documentAction).to.be.equal(Document.ACTIONS.CREATE);
    expect(trigger.trigger).to.be.equal(domainCreateDataTrigger);
  });

  it('should check trigger execution', async () => {
    const trigger = new DataTrigger(documentType, Document.ACTIONS.CREATE, domainCreateDataTrigger);
    const result = await trigger.execute(childDocument, context);

    expect(result).to.be.instanceOf(DataTriggerExecutionResult);
  });

  it('should fail with invalid type', async () => {
    const [document] = getDocumentsFixture();
    const trigger = new DataTrigger(documentType, Document.ACTIONS.CREATE, domainCreateDataTrigger);
    const result = await trigger.execute(document, context);

    expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    expect(result.getErrors()).to.be.an('array');
    expect(result.getErrors().length).to.be.equal(1);
    expect(result.isOk()).is.false();
    expect(result.getErrors()[0]).to.be.an.instanceOf(DataTriggerExecutionError);
    expect(result.getErrors()[0].message).to.be.equal('Document type doesn\'t match trigger type');
  });
});
