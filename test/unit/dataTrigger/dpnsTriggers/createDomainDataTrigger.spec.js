const createDomainDataTrigger = require('../../../../lib/dataTrigger/dpnsTriggers/createDomainDataTrigger');
const TriggerResult = require('../../../../lib/dataTrigger/TriggerResult');
const DataTriggerExecutionContext = require('../../../../lib/dataTrigger/DataTriggerExecutionContext');
const { getParentDocumentFixture, getChildDocumentFixture } = require('../../../../lib/test/fixtures/getDpnsDocumentFixture');
const getPreorderDocumentFixture = require('../../../../lib/test/fixtures/getPreorderDocumentFixture');
const getDpnsContractFixture = require('../../../../lib/test/fixtures/getDpnsContractFixture');
const createDataProviderMock = require('../../../../lib/test/mocks/createDataProviderMock');
const Document = require('../../../../lib/document/Document');
const multihash = require('../../../../lib/util/multihash');

describe('createDomainDataTrigger', () => {
  let parentDocument;
  let childDocument;
  let preorderDocument;
  let context;
  let dataProviderMock;
  let contract;

  beforeEach(function beforeEach() {
    contract = getDpnsContractFixture();

    parentDocument = getParentDocumentFixture();
    childDocument = getChildDocumentFixture();
    preorderDocument = getPreorderDocumentFixture();

    const {
      preorderSalt, hash, records, parentDomainHash,
    } = childDocument.getData();

    dataProviderMock = createDataProviderMock(this.sinonSandbox);
    dataProviderMock.fetchDocuments.resolves([]);
    dataProviderMock.fetchDocuments
      .withArgs(
        contract.getId(),
        childDocument.getType(),
        { where: ['hash', '==', parentDomainHash] },
      )
      .resolves([parentDocument.toJSON()]);

    const saltedDomainHash = multihash(Buffer.from(preorderSalt + hash, 'hex')).toString('hex');

    dataProviderMock.fetchDocuments
      .withArgs(
        contract.getId(),
        'preorder',
        { where: ['saltedDomainHash', '==', saltedDomainHash] },
      )
      .resolves([preorderDocument.toJSON()]);

    dataProviderMock.fetchTransaction.resolves(null);

    dataProviderMock.fetchTransaction
      .withArgs(
        records.dashIdentity,
      )
      .resolves({ confirmations: 10 });

    context = new DataTriggerExecutionContext(
      dataProviderMock,
      records.dashIdentity,
      contract,
    );
  });

  it('should check result is TriggerResult instance and has no errors', async () => {
    const result = await createDomainDataTrigger(childDocument, context);

    expect(result).to.be.an.instanceOf(TriggerResult);
    expect(result.getMessage()).to.be.a('string');
    expect(result.getMessage()).to.be.equal('');
    expect(result.isOk()).is.true();
  });

  it('should fail with invalid hash', async () => {
    childDocument = getChildDocumentFixture({ hash: 'invalidHash' });
    dataProviderMock.fetchTransaction
      .withArgs(
        childDocument.getData().records.dashIdentity,
      )
      .resolves({ confirmations: 10 });


    const result = await createDomainDataTrigger(childDocument, context);

    expect(result).to.be.an.instanceOf(TriggerResult);
    expect(result.isOk()).is.false();
    expect(result.getMessage()).to.be.equal('Document hash doesn\'t match actual hash');
  });

  it('should fail with invalid normalizedLabel', async () => {
    childDocument = getChildDocumentFixture({ normalizedLabel: childDocument.getData().label });
    dataProviderMock.fetchTransaction
      .withArgs(
        childDocument.getData().records.dashIdentity,
      )
      .resolves({ confirmations: 10 });

    const result = await createDomainDataTrigger(childDocument, context);

    expect(result).to.be.an.instanceOf(TriggerResult);
    expect(result.isOk()).is.false();
    expect(result.getMessage()).to.be.equal('Normalized label doesn\'t match label');
  });

  it('should fail with invalid parrentDomain', async () => {
    childDocument = getChildDocumentFixture({ parentDomainHash: 'invalidHash' });
    dataProviderMock.fetchTransaction
      .withArgs(
        childDocument.getData().records.dashIdentity,
      )
      .resolves({ confirmations: 10 });

    const result = await createDomainDataTrigger(childDocument, context);

    expect(result).to.be.an.instanceOf(TriggerResult);
    expect(result.isOk()).is.false();
    expect(result.getMessage()).to.be.equal('Can\'t find parent domain matching parent hash');
  });

  it('should fail with invalid transaction', async () => {
    childDocument = getChildDocumentFixture({
      records: {
        dashIdentity: 'invalidHash',
      },
    });

    const result = await createDomainDataTrigger(childDocument, context);

    expect(result).to.be.an.instanceOf(TriggerResult);
    expect(result.isOk()).is.false();
    expect(result.getMessage()).to.be.equal('dashIdentity with corresponding id not found');
  });

  // it('should fail with invalid action', async () => {
  //   childDocument.setAction(Document.ACTIONS.UPDATE);
  //
  //   const result = await createDomainDataTrigger(childDocument, context);
  //
  //   expect(result).to.be.an.instanceOf(TriggerResult);
  //   expect(result.isOk()).is.false();
  //   expect(result.getMessage()).to.be.equal('Document action doesn\'t match trigger action');
  // });
});
