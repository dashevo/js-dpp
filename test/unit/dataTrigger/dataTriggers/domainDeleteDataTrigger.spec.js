const domainDeleteDataTrigger = require('../../../../lib/dataTrigger/dataTriggers/domainDeleteDataTrigger');
const DataTriggerExecutionResult = require('../../../../lib/dataTrigger/DataTriggerExecutionResult');
const DataTriggerExecutionError = require('../../../../lib/errors/DataTriggerExecutionError');
const { getChildDocumentFixture } = require('../../../../lib/test/fixtures/getDpnsDocumentFixture');
const Document = require('../../../../lib/document/Document');

describe('domainCreateDataTrigger', () => {
  let document;

  beforeEach(() => {
    document = getChildDocumentFixture();
  });

  it('should check result is DataTriggerExecutionResult instance and has no errors', async () => {
    const result = await domainDeleteDataTrigger(document);

    expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    expect(result.getErrors()).to.be.an('array');
    expect(result.getErrors().length).to.be.equal(0);
    expect(result.isOk()).is.true();
  });

  it('should fail with invalid action', async () => {
    document.setData({}).setAction(Document.ACTIONS.DELETE);

    const result = await domainDeleteDataTrigger(document);

    expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    expect(result.getErrors()).to.be.an('array');
    expect(result.getErrors().length).to.be.equal(1);
    expect(result.isOk()).is.false();
    expect(result.getErrors()[0]).to.be.an.instanceOf(DataTriggerExecutionError);
    expect(result.getErrors()[0].message).to.be.equal('Delete action is not allowed');
  });
});