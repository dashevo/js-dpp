const DataTrigger = require('../../../lib/dataTrigger/DataTrigger');
const DataTriggerExecutionContext = require('../../../lib/dataTrigger/DataTriggerExecutionContext');
const createDataProviderMock = require('../../../lib/test/mocks/createDataProviderMock');
const getDpnsContractFixture = require('../../../lib/test/fixtures/getDpnsContractFixture');
const { getParentDocumentFixture, getChildDocumentFixture } = require('../../../lib/test/fixtures/getDpnsDocumentFixture');
const DataTriggerExecutionResult = require('../../../lib/dataTrigger/DataTriggerExecutionResult');
const getDocumentsFixture = require('../../../lib/test/fixtures/getDocumentsFixture');
const DataTriggerExecutionError = require('../../../lib/errors/DataTriggerExecutionError');
const DataTriggerInvalidResultError = require('../../../lib/errors/DataTriggerInvalidResultError');

describe('DataTrigger', () => {
  let contractMock;
  let context;
  let dataProviderMock;
  let parentDocumentMock;
  let childDocumentMock;
  let triggerStub;
  let document;

  beforeEach(function beforeEach() {
    triggerStub = this.sinonSandbox.stub().resolves(new DataTriggerExecutionResult());
    contractMock = getDpnsContractFixture();

    ([document] = getDocumentsFixture());

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
      contractMock.getId(),
      document.getType(),
      document.getAction(),
      triggerStub,
    );

    expect(trigger.contractId).to.equal(contractMock.getId());
    expect(trigger.documentType).to.equal(document.getType());
    expect(trigger.documentAction).to.equal(document.getAction());
    expect(trigger.trigger).to.equal(triggerStub);
  });

  describe('#execute', () => {
    it('should check trigger execution', async () => {
      const trigger = new DataTrigger(
        contractMock.getId(),
        document.getType(),
        document.getAction(),
        triggerStub,
      );

      const result = await trigger.execute(context);

      expect(result).to.be.instanceOf(DataTriggerExecutionResult);
    });

    it('should pass through the result of the trigger function', async () => {
      const functionResult = new DataTriggerExecutionResult();

      const triggerError = new Error('Trigger error');

      functionResult.addError(triggerError);

      triggerStub.resolves(functionResult);

      const trigger = new DataTrigger(
        contractMock.getId(),
        document.getType(),
        document.getAction(),
        triggerStub,
      );

      const result = await trigger.execute(document, context);

      expect(result).to.deep.equal(functionResult);
      expect(result.getErrors()[0]).to.deep.equal(triggerError);
    });

    it('should return a result with execution error if trigger function have thrown an error', async () => {
      const triggerError = new Error('Trigger error');

      triggerStub.throws(triggerError);

      const trigger = new DataTrigger(
        contractMock.getId(),
        document.getType(),
        document.getAction(),
        triggerStub,
      );

      const result = await trigger.execute(context);

      expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
      expect(result.getErrors()[0]).to.be.an.instanceOf(DataTriggerExecutionError);
      expect(result.getErrors()[0].message).to.equal(triggerError.message);
    });

    it('should return a result with invalid result error if trigger function have not returned any result', async () => {
      triggerStub.resolves(null);

      const trigger = new DataTrigger(
        contractMock.getId(),
        document.getType(),
        document.getAction(),
        triggerStub,
      );

      const result = await trigger.execute(context);

      expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
      expect(result.getErrors()[0]).to.be.an.instanceOf(DataTriggerInvalidResultError);
      expect(result.getErrors()[0].message).to.equal('Data trigger have not returned any result');
    });
  });
});
