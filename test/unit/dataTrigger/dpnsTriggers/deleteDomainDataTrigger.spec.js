const deleteDomainDataTrigger = require('../../../../lib/dataTrigger/dpnsTriggers/deleteDomainDataTrigger');
const DataTriggerExecutionContext = require('../../../../lib/dataTrigger/DataTriggerExecutionContext');
const { getChildDocumentFixture } = require('../../../../lib/test/fixtures/getDpnsDocumentFixture');
const Document = require('../../../../lib/document/Document');
const createDataProviderMock = require('../../../../lib/test/mocks/createDataProviderMock');
const getDpnsContractFixture = require('../../../../lib/test/fixtures/getDpnsContractFixture');
const TriggerResult = require('../../../../lib/dataTrigger/TriggerResult');

describe('deleteDomainDataTrigger', () => {
  let document;
  let context;
  let dataProviderMock;
  let contract;

  beforeEach(function beforeEach() {
    contract = getDpnsContractFixture();
    document = getChildDocumentFixture();

    dataProviderMock = createDataProviderMock(this.sinonSandbox);
    context = new DataTriggerExecutionContext(
      dataProviderMock,
      '6b74011f5d2ad1a8d45b71b9702f54205ce75253593c3cfbba3fdadeca278288',
      contract,
    );
  });

  it('should always fail', async () => {
    document.setData({}).setAction(Document.ACTIONS.DELETE);

    const result = await deleteDomainDataTrigger(document, context);

    expect(result).to.be.an.instanceOf(TriggerResult);
    expect(result.getMessage()).to.be.equal('Delete action is not allowed');
    expect(result.isOk()).is.false();
  });
});
