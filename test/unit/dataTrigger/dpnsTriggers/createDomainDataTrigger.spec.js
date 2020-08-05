const createDomainDataTrigger = require('../../../../lib/dataTrigger/dpnsTriggers/createDomainDataTrigger');

const DataTriggerExecutionContext = require('../../../../lib/dataTrigger/DataTriggerExecutionContext');
const DataTriggerExecutionResult = require('../../../../lib/dataTrigger/DataTriggerExecutionResult');

const { getParentDocumentFixture, getChildDocumentFixture } = require('../../../../lib/test/fixtures/getDpnsDocumentFixture');
const getPreorderDocumentFixture = require('../../../../lib/test/fixtures/getPreorderDocumentFixture');
const getDpnsContractFixture = require('../../../../lib/test/fixtures/getDpnsContractFixture');
const getDocumentTransitionFixture = require('../../../../lib/test/fixtures/getDocumentTransitionsFixture');
const createStateRepositoryMock = require('../../../../lib/test/mocks/createStateRepositoryMock');

const hash = require('../../../../lib/util/hash');

const DataTriggerConditionError = require('../../../../lib/errors/DataTriggerConditionError');

describe('createDomainDataTrigger', () => {
  let parentDocumentTransition;
  let childDocumentTransition;
  let childDocument;
  let parentDocument;
  let context;
  let stateRepositoryMock;
  let dataContract;
  let topLevelIdentity;

  beforeEach(function beforeEach() {
    dataContract = getDpnsContractFixture();

    parentDocument = getParentDocumentFixture();
    childDocument = getChildDocumentFixture();
    const preorderDocument = getPreorderDocumentFixture();

    [parentDocumentTransition] = getDocumentTransitionFixture({
      create: [parentDocument],
    });

    [childDocumentTransition] = getDocumentTransitionFixture({
      create: [childDocument],
    });

    const {
      preorderSalt, records, normalizedParentDomainName, normalizedLabel,
    } = childDocument.getData();

    let fullDomainName = normalizedLabel;
    if (normalizedParentDomainName.length > 0) {
      fullDomainName = `${normalizedLabel}.${normalizedParentDomainName}`;
    }

    stateRepositoryMock = createStateRepositoryMock(this.sinonSandbox);
    stateRepositoryMock.fetchDocuments.resolves([]);
    stateRepositoryMock.fetchDocuments
      .withArgs(
        dataContract.getId(),
        childDocument.getType(),
        {
          where: [
            ['normalizedParentDomainName', '==', normalizedParentDomainName],
            ['normalizedLabel', '==', normalizedLabel],
          ],
        },
      )
      .resolves([parentDocument]);

    const saltedDomainHashBuffer = Buffer.concat([
      preorderSalt,
      Buffer.from(fullDomainName),
    ]);

    const saltedDomainHash = hash(saltedDomainHashBuffer)
      .toString('hex');

    stateRepositoryMock.fetchDocuments
      .withArgs(
        dataContract.getId(),
        'preorder',
        { where: [['saltedDomainHash', '==', saltedDomainHash]] },
      )
      .resolves([preorderDocument.toJSON()]);

    stateRepositoryMock.fetchTransaction.resolves(null);

    stateRepositoryMock.fetchTransaction
      .withArgs(
        records.dashUniqueIdentityId,
      )
      .resolves({ confirmations: 10 });

    context = new DataTriggerExecutionContext(
      stateRepositoryMock,
      records.dashUniqueIdentityId,
      dataContract,
    );

    topLevelIdentity = context.getOwnerId();
  });

  it('should successfully execute if document is valid', async () => {
    const result = await createDomainDataTrigger(
      childDocumentTransition, context, topLevelIdentity,
    );

    expect(result.isOk()).to.be.true();
  });

  it('should fail with invalid normalizedLabel', async () => {
    childDocument = getChildDocumentFixture({ normalizedLabel: childDocument.getData().label });
    stateRepositoryMock.fetchTransaction
      .withArgs(
        childDocument.getData().records.dashUniqueIdentityId,
      )
      .resolves({ confirmations: 10 });

    [childDocumentTransition] = getDocumentTransitionFixture({
      create: [childDocument],
    });

    const result = await createDomainDataTrigger(
      childDocumentTransition, context, topLevelIdentity,
    );

    expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    expect(result.isOk()).to.be.false();

    const [error] = result.getErrors();

    expect(error).to.be.an.instanceOf(DataTriggerConditionError);
    expect(error.message).to.equal('Normalized label doesn\'t match label');
  });

  it('should fail with invalid parent domain', async () => {
    childDocument = getChildDocumentFixture({
      label: 'label',
      normalizedLabel: 'label',
      normalizedParentDomainName: 'invalidname',
    });

    stateRepositoryMock.fetchTransaction
      .withArgs(
        childDocument.getData().records.dashUniqueIdentityId,
      )
      .resolves({ confirmations: 10 });

    [childDocumentTransition] = getDocumentTransitionFixture({
      create: [childDocument],
    });

    const result = await createDomainDataTrigger(
      childDocumentTransition, context, topLevelIdentity,
    );

    expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    expect(result.isOk()).to.be.false();

    const [error] = result.getErrors();

    expect(error).to.be.an.instanceOf(DataTriggerConditionError);
    expect(error.message).to.equal('Parent domain is not present');
  });

  it('should fail with invalid dashUniqueIdentityId', async () => {
    childDocument = getChildDocumentFixture({
      records: {
        dashUniqueIdentityId: 'invalidHash',
      },
    });

    [childDocumentTransition] = getDocumentTransitionFixture({
      create: [childDocument],
    });

    const result = await createDomainDataTrigger(
      childDocumentTransition, context, topLevelIdentity,
    );

    expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    expect(result.isOk()).to.be.false();

    const [error] = result.getErrors();

    expect(error).to.be.an.instanceOf(DataTriggerConditionError);
    expect(error.message).to.equal('ownerId doesn\'t match dashUniqueIdentityId');
  });

  it('should fail with invalid dashAliasIdentityId', async () => {
    childDocument = getChildDocumentFixture({
      records: {
        dashAliasIdentityId: 'invalidHash',
      },
    });

    [childDocumentTransition] = getDocumentTransitionFixture({
      create: [childDocument],
    });

    const result = await createDomainDataTrigger(
      childDocumentTransition, context, topLevelIdentity,
    );

    expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    expect(result.isOk()).to.be.false();

    const [error] = result.getErrors();

    expect(error).to.be.an.instanceOf(DataTriggerConditionError);
    expect(error.message).to.equal('ownerId doesn\'t match dashAliasIdentityId');
  });

  it('should fail with preorder document was not found', async () => {
    childDocument = getChildDocumentFixture({
      preorderSalt: Buffer.alloc(256, '012fd'),
    });

    [childDocumentTransition] = getDocumentTransitionFixture({
      create: [childDocument],
    });

    const result = await createDomainDataTrigger(
      childDocumentTransition, context, topLevelIdentity,
    );

    expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    expect(result.isOk()).to.be.false();

    const [error] = result.getErrors();

    expect(error).to.be.an.instanceOf(DataTriggerConditionError);
    expect(error.message).to.equal('preorderDocument was not found');
  });

  it('should fail with invalid full domain name length', async () => {
    childDocument = getChildDocumentFixture({
      normalizedParentDomainName: Buffer.alloc(512).toString('hex'),
    });

    [childDocumentTransition] = getDocumentTransitionFixture({
      create: [childDocument],
    });

    const result = await createDomainDataTrigger(
      childDocumentTransition, context, topLevelIdentity,
    );

    expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    expect(result.isOk()).to.be.false();

    const [error] = result.getErrors();

    expect(error).to.be.an.instanceOf(DataTriggerConditionError);
    expect(error.message).to.equal(
      'Full domain name length can not be more than 253 characters long',
    );
  });

  it('should fail with identity can\'t create top level domain', async () => {
    parentDocumentTransition.data.normalizedParentDomainName = '';

    topLevelIdentity = 'someIdentity';

    const result = await createDomainDataTrigger(
      parentDocumentTransition, context, topLevelIdentity,
    );

    expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    expect(result.isOk()).to.be.false();

    const [error] = result.getErrors();

    expect(error).to.be.an.instanceOf(DataTriggerConditionError);
    expect(error.message).to.equal(
      'Can\'t create top level domain for this identity',
    );
  });

  it('should fail with disallowed domain creation', async () => {
    childDocument.data.subdomainRules.allowSubdomains = false;
    parentDocument.ownerId = 'newId';

    const result = await createDomainDataTrigger(
      childDocument, context, topLevelIdentity,
    );

    expect(result).to.be.an.instanceOf(DataTriggerExecutionResult);
    expect(result.isOk()).to.be.false();

    const [error] = result.getErrors();
    expect(error).to.be.an.instanceOf(DataTriggerConditionError);
    expect(error.message).to.equal(
      'The subdomain can be created only by the parent domain owner',
    );
  });
});
