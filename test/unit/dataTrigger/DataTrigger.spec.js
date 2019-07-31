const DataTrigger = require('../../../lib/dataTrigger/DataTrigger');
const Document = require('../../../lib/document/Document');
const DataTriggerExecutionContext = require('../../../lib/dataTrigger/DataTriggerExecutionContext');
const createDataProviderMock = require('../../../lib/test/mocks/createDataProviderMock');
const getDpnsContractFixture = require('../../../lib/test/fixtures/getDpnsContractFixture');
const { getParentDocumentFixture, getChildDocumentFixture } = require('../../../lib/test/fixtures/getDpnsDocumentFixture');
const DataTriggerExecutionResult = require('../../../lib/dataTrigger/DataTriggerExecutionResult');
const getDocumentsFixture = require('../../../lib/test/fixtures/getDocumentsFixture');
const DataTriggerExecutionError = require('../../../lib/errors/DataTriggerExecutionError');

const documentType = 'domain';

describe('DataTrigger', () => {
  let contractMock;
  let context;
  let dataProviderMock;
  let parentDocumentMock;
  let childDocumentMock;
  let triggerStub;

  beforeEach(function beforeEach() {
    triggerStub = this.sinonSandbox.stub().resolves(new DataTriggerExecutionResult());
    contractMock = getDpnsContractFixture();

    parentDocumentMock = getParentDocumentFixture();
    childDocumentMock = getChildDocumentFixture();

    dataProviderMock = createDataProviderMock(this.sinonSandbox);
    dataProviderMock.fetchDocuments.resolves([]);
    dataProviderMock.fetchDocuments
      .withArgs(
        contractMock.getId(),
        childDocumentMock.getType(),
        { where: ['hash', '==', childDocumentMock.getData().parentDomainHash] },
      )
      .resolves([parentDocumentMock.toJSON()]);
    dataProviderMock.fetchTransaction.resolves(null);
    dataProviderMock.fetchTransaction
      .withArgs(
        childDocumentMock.getData().records.dashIdentity,
      )
      .resolves({ confirmations: 10 });

    context = new DataTriggerExecutionContext(
      dataProviderMock,
      '6b74011f5d2ad1a8d45b71b9702f54205ce75253593c3cfbba3fdadeca278288',
      contractMock,
    );
  });

  it('should check trigger fields', () => {
    const trigger = new DataTrigger(
      documentType,
      Document.ACTIONS.CREATE,
      triggerStub,
      contractMock,
    );

    expect(trigger.documentType).to.be.equal(documentType);
    expect(trigger.documentAction).to.be.equal(Document.ACTIONS.CREATE);
    expect(trigger.trigger).to.be.equal(triggerStub);
  });

  describe('#execute', () => {
    it('should check trigger execution', async () => {
      const trigger = new DataTrigger(
        documentType,
        Document.ACTIONS.CREATE,
        triggerStub,
        contractMock,
      );
      const result = await trigger.execute(childDocumentMock, context);

      expect(result).to.be.instanceOf(DataTriggerExecutionResult);
    });

    it('should return result with an error if document type doesn\'t match trigger type', async () => {
      const [document] = getDocumentsFixture();
      const trigger = new DataTrigger(
        documentType,
        Document.ACTIONS.CREATE,
        triggerStub,
        contractMock,
      );
      const result = await trigger.execute(document, context);

      expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
      expect(result.getErrors()).to.be.an('array');
      expect(result.getErrors().length).to.be.equal(1);
      expect(result.isOk()).is.false();
      expect(result.getErrors()[0]).to.be.an.instanceOf(DataTriggerExecutionError);
      expect(result.getErrors()[0].message).to.be.equal('Document type doesn\'t match trigger type');
    });

    it('should return result with an error if document action doesn\'t match trigger action', async () => {
      const [document] = getDocumentsFixture();
      const trigger = new DataTrigger('niceDocument', Document.ACTIONS.UPDATE, triggerStub, contractMock);
      const result = await trigger.execute(document, context);

      expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
      expect(result.getErrors()).to.be.an('array');
      expect(result.getErrors().length).to.be.equal(1);
      expect(result.isOk()).is.false();
      expect(result.getErrors()[0]).to.be.an.instanceOf(DataTriggerExecutionError);
      expect(result.getErrors()[0].message).to.be.equal('Document action doesn\'t match trigger action');
    });

    // it('should catch DataTriggerExecutionError thrown from the callback and add it to the result', async () => {
    //   const [document] = getDocumentsFixture();
    //   triggerStub.throws(new DataTriggerExecutionError(document, context, 'Error from stub'));
    //   const trigger = new DataTrigger('niceDocument', Document.ACTIONS.CREATE, triggerStub, contractMock);
    //   const result = await trigger.execute(document, context);
    //
    //   expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    //   expect(result.getErrors()).to.be.an('array');
    //   expect(result.getErrors().length).to.be.equal(1);
    //   expect(result.isOk()).is.false();
    //   expect(result.getErrors()[0]).to.be.an.instanceOf(DataTriggerExecutionError);
    //   expect(result.getErrors()[0].message).to.be.equal('Error from stub');
    // });
    //
    // it("should add an error to result if trigger didn't return true and haven't throw any errors", async () => {
    //   const [document] = getDocumentsFixture();
    //   triggerStub.returns(false);
    //   const trigger = new DataTrigger('niceDocument', Document.ACTIONS.CREATE, triggerStub, contractMock);
    //   const result = await trigger.execute(document, context);
    //
    //   expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    //   expect(result.getErrors()).to.be.an('array');
    //   expect(result.getErrors().length).to.be.equal(1);
    //   expect(result.isOk()).is.false();
    //   expect(result.getErrors()[0]).to.be.an.instanceOf(DataTriggerExecutionError);
    //   expect(result.getErrors()[0].message).to.be.equal("Data trigger haven't finished successfully");
    // });
    //
    // it('should suppress error thrown from the trigger callback if it isn\'t a DataTriggerExecutionError', async () => {
    //   const [document] = getDocumentsFixture();
    //   triggerStub.throws(new Error('Error from stub'));
    //   const trigger = new DataTrigger('niceDocument', Document.ACTIONS.CREATE, triggerStub, contractMock);
    //   const result = await trigger.execute(document, context);
    //
    //   expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    //   expect(result.getErrors()).to.be.an('array');
    //   expect(result.getErrors().length).to.be.equal(1);
    //   expect(result.isOk()).is.false();
    //   expect(result.getErrors()[0]).to.be.an.instanceOf(DataTriggerExecutionError);
    //   expect(result.getErrors()[0].message).to.be.equal('Unexpected error occurred while executing data trigger');
    // });
  });
});
