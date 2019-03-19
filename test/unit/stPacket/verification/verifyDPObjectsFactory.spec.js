const verifyDPObjectsFactory = require('../../../../lib/stPacket/verification/verifyDPObjectsFactory');

const STPacket = require('../../../../lib/stPacket/STPacket');
const Document = require('../../../../lib/document/Document');

const getDPObjectsFixture = require('../../../../lib/test/fixtures/getDPObjectsFixture');
const getDPContractFixture = require('../../../../lib/test/fixtures/getDPContractFixture');

const ValidationResult = require('../../../../lib/validation/ValidationResult');

const { expectValidationError } = require('../../../../lib/test/expect/expectError');

const InvalidDPObjectScopeError = require('../../../../lib/errors/InvalidDPObjectScopeError');
const DPObjectAlreadyPresentError = require('../../../../lib/errors/DPObjectAlreadyPresentError');
const DPObjectNotFoundError = require('../../../../lib/errors/DPObjectNotFoundError');
const InvalidDPObjectRevisionError = require('../../../../lib/errors/InvalidDPObjectRevisionError');
const InvalidDPObjectActionError = require('../../../../lib/stPacket/errors/InvalidDPObjectActionError');

describe('verifyDPObjects', () => {
  let verifyDPObjects;
  let fetchDPObjectsByObjectsMock;
  let stPacket;
  let documents;
  let dpContract;
  let userId;
  let verifyDPObjectsUniquenessByIndices;

  beforeEach(function beforeEach() {
    ({ userId } = getDPObjectsFixture);

    documents = getDPObjectsFixture();
    dpContract = getDPContractFixture();

    stPacket = new STPacket(dpContract.getId());
    stPacket.setDocuments(documents);

    fetchDPObjectsByObjectsMock = this.sinonSandbox.stub();

    verifyDPObjectsUniquenessByIndices = this.sinonSandbox.stub();
    verifyDPObjectsUniquenessByIndices.resolves(new ValidationResult());

    verifyDPObjects = verifyDPObjectsFactory(
      fetchDPObjectsByObjectsMock,
      verifyDPObjectsUniquenessByIndices,
    );
  });

  it('should return invalid result if Document has wrong scope', async () => {
    documents[0].scope = 'wrong';

    fetchDPObjectsByObjectsMock.resolves([]);

    const result = await verifyDPObjects(stPacket, userId, dpContract);

    expectValidationError(result, InvalidDPObjectScopeError);

    expect(fetchDPObjectsByObjectsMock).to.have.been.calledOnceWith(
      stPacket.getDPContractId(),
      documents,
    );

    const [error] = result.getErrors();

    expect(error.getDocument()).to.equal(documents[0]);
  });

  it('should return invalid result if Document with action "create" is already present', async () => {
    fetchDPObjectsByObjectsMock.resolves([documents[0]]);

    const result = await verifyDPObjects(stPacket, userId, dpContract);

    expectValidationError(result, DPObjectAlreadyPresentError);

    expect(fetchDPObjectsByObjectsMock).to.have.been.calledOnceWith(
      stPacket.getDPContractId(),
      documents,
    );

    const [error] = result.getErrors();

    expect(error.getDocument()).to.equal(documents[0]);
    expect(error.getFetchedDocument()).to.equal(documents[0]);
  });

  it('should return invalid result if Document with action "update" is not present', async () => {
    documents[0].setAction(Document.ACTIONS.UPDATE);

    fetchDPObjectsByObjectsMock.resolves([]);

    const result = await verifyDPObjects(stPacket, userId, dpContract);

    expectValidationError(result, DPObjectNotFoundError);

    expect(fetchDPObjectsByObjectsMock).to.have.been.calledOnceWith(
      stPacket.getDPContractId(),
      documents,
    );

    const [error] = result.getErrors();

    expect(error.getDocument()).to.equal(documents[0]);
  });

  it('should return invalid result if Document with action "delete" is not present', async () => {
    documents[0].setData({});
    documents[0].setAction(Document.ACTIONS.DELETE);

    fetchDPObjectsByObjectsMock.resolves([]);

    const result = await verifyDPObjects(stPacket, userId, dpContract);

    expectValidationError(result, DPObjectNotFoundError);

    expect(fetchDPObjectsByObjectsMock).to.have.been.calledOnceWith(
      stPacket.getDPContractId(),
      documents,
    );

    const [error] = result.getErrors();

    expect(error.getDocument()).to.equal(documents[0]);
  });

  it('should return invalid result if Document with action "update" has wrong revision', async () => {
    documents[0].setAction(Document.ACTIONS.UPDATE);

    fetchDPObjectsByObjectsMock.resolves([documents[0]]);

    const result = await verifyDPObjects(stPacket, userId, dpContract);

    expectValidationError(result, InvalidDPObjectRevisionError);

    expect(fetchDPObjectsByObjectsMock).to.have.been.calledOnceWith(
      stPacket.getDPContractId(),
      documents,
    );

    const [error] = result.getErrors();

    expect(error.getDocument()).to.equal(documents[0]);
    expect(error.getFetchedDocument()).to.equal(documents[0]);
  });

  it('should return invalid result if Document with action "delete" has wrong revision', async () => {
    documents[0].setData({});
    documents[0].setAction(Document.ACTIONS.DELETE);

    fetchDPObjectsByObjectsMock.resolves([documents[0]]);

    const result = await verifyDPObjects(stPacket, userId, dpContract);

    expectValidationError(result, InvalidDPObjectRevisionError);

    expect(fetchDPObjectsByObjectsMock).to.have.been.calledOnceWith(
      stPacket.getDPContractId(),
      documents,
    );

    const [error] = result.getErrors();

    expect(error.getDocument()).to.equal(documents[0]);
  });

  it('should throw an error if Document has invalid action', async () => {
    documents[0].setAction(5);

    fetchDPObjectsByObjectsMock.resolves([documents[0]]);

    let error;
    try {
      await verifyDPObjects(stPacket, userId, dpContract);
    } catch (e) {
      error = e;
    }

    expect(error).to.be.an.instanceOf(InvalidDPObjectActionError);
    expect(error.getDocument()).to.equal(documents[0]);
  });

  it('should return valid result if DPObjects are valid', async () => {
    const fetchedDPObjects = [
      new Document(documents[1].toJSON()),
      new Document(documents[2].toJSON()),
    ];

    fetchDPObjectsByObjectsMock.resolves(fetchedDPObjects);

    documents[1].setAction(Document.ACTIONS.UPDATE);
    documents[1].setRevision(1);

    documents[2].setData({});
    documents[2].setAction(Document.ACTIONS.DELETE);
    documents[2].setRevision(1);

    const result = await verifyDPObjects(stPacket, userId, dpContract);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();
  });
});
