const domainDeleteDataTrigger = require('../../../../lib/dataTrigger/dpnsTriggers/deleteDomainDataTrigger');
const DataTriggerExecutionResult = require('../../../../lib/dataTrigger/DataTriggerExecutionResult');
const DataTriggerExecutionError = require('../../../../lib/errors/DataTriggerExecutionError');
const DataTriggerExecutionContext = require('../../../../lib/dataTrigger/DataTriggerExecutionContext');
const { getChildDocumentFixture } = require('../../../../lib/test/fixtures/getDpnsDocumentFixture');
const Document = require('../../../../lib/document/Document');
const createDataProviderMock = require('../../../../lib/test/mocks/createDataProviderMock');
const getDpnsContractFixture = require('../../../../lib/test/fixtures/getDpnsContractFixture');

describe('domainDeleteDataTrigger', () => {
  let document;
  let context;
  let dataProviderMock;
  let contract;

  beforeEach(function beforeEach() {
    contract = getDpnsContractFixture();
    document = getChildDocumentFixture();

    // document.setData({});
    // document.setAction(Document.ACTIONS.U
    dataProviderMock = createDataProviderMock(this.sinonSandbox);
    context = new DataTriggerExecutionContext(
      dataProviderMock,
      '6b74011f5d2ad1a8d45b71b9702f54205ce75253593c3cfbba3fdadeca278288',
      contract,
    );
  });

  it('should always fail', async () => {
    document.setData({}).setAction(Document.ACTIONS.DELETE);

    const result = await domainDeleteDataTrigger.execute(document, context);

    expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    expect(result.getErrors()).to.be.an('array');
    expect(result.getErrors().length).to.be.equal(1);
    expect(result.isOk()).is.false();
    expect(result.getErrors()[0]).to.be.an.instanceOf(DataTriggerExecutionError);
    expect(result.getErrors()[0].message).to.be.equal('Delete action is not allowed');
  });
});
