const domainUpdateDataTrigger = require('../../../../lib/dataTrigger/dpnsTriggers/updateDomainDataTrigger');
const DataTriggerExecutionContext = require('../../../../lib/dataTrigger/DataTriggerExecutionContext');
const { getChildDocumentFixture } = require('../../../../lib/test/fixtures/getDpnsDocumentFixture');
const createStateRepositoryMock = require('../../../../lib/test/mocks/createStateRepositoryMock');
const getDpnsContractFixture = require('../../../../lib/test/fixtures/getDpnsContractFixture');
const DataTriggerExecutionResult = require('../../../../lib/dataTrigger/DataTriggerExecutionResult');

describe('updateDomainDataTrigger', () => {
  let document;
  let context;
  let stateRepositoryMock;
  let dataContract;

  beforeEach(function beforeEach() {
    dataContract = getDpnsContractFixture();
    document = getChildDocumentFixture();
    stateRepositoryMock = createStateRepositoryMock(this.sinonSandbox);
    context = new DataTriggerExecutionContext(
      stateRepositoryMock,
      '6b74011f5d2ad1a8d45b71b9702f54205ce75253593c3cfbba3fdadeca278288',
      dataContract,
    );
  });

  it('should always fail', async () => {
    const result = await domainUpdateDataTrigger(document, context);

    expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    expect(result.getErrors()[0].message).to.equal('Update action is not allowed');
    expect(result.isOk()).to.be.false();
  });
});
