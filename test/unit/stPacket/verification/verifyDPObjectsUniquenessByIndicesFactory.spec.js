const bs58 = require('bs58');

const verifyDPObjectsUniquenessByIndicesFactory = require('../../../../lib/stPacket/verification/verifyDPObjectsUniquenessByIndicesFactory');

const STPacket = require('../../../../lib/stPacket/STPacket');

const getDPObjectsFixture = require('../../../../lib/test/fixtures/getDPObjectsFixture');
const getDPContractFixture = require('../../../../lib/test/fixtures/getDPContractFixture');

const { expectValidationError } = require('../../../../lib/test/expect/expectError');
const createDataProviderMock = require('../../../../lib/test/mocks/createDataProviderMock');

const DuplicateDPObjectError = require('../../../../lib/errors/DuplicateDPObjectError');

function encodeToBase58(id) {
  const idBuffer = Buffer.from(id, 'hex');
  return bs58.encode(idBuffer);
}

describe('verifyDPObjectsUniquenessByIndices', () => {
  let fetchDPObjectsByObjectsMock;
  let dataProviderMock;
  let verifyDPObjectsUniquenessByIndices;
  let stPacket;
  let documents;
  let dpContract;
  let userId;

  beforeEach(function beforeEach() {
    ({ userId } = getDPObjectsFixture);

    documents = getDPObjectsFixture();
    dpContract = getDPContractFixture();

    stPacket = new STPacket(dpContract.getId());
    stPacket.setDocuments(documents);

    fetchDPObjectsByObjectsMock = this.sinonSandbox.stub();

    dataProviderMock = createDataProviderMock(this.sinonSandbox);
    dataProviderMock.fetchDPObjects.resolves([]);

    verifyDPObjectsUniquenessByIndices = verifyDPObjectsUniquenessByIndicesFactory(
      fetchDPObjectsByObjectsMock,
      dataProviderMock,
    );
  });

  it('should return invalid result if Document has unique indices and there are duplicates', async () => {
    const [, , , william, leon] = documents;

    const indicesDefinition = dpContract.getDPObjectSchema(william.getType()).indices;

    dataProviderMock.fetchDPObjects.resolves([]);

    dataProviderMock.fetchDPObjects
      .withArgs(
        stPacket.getDPContractId(),
        william.getType(),
        {
          where: {
            'document.$userId': william.get('$userId'),
            'document.firstName': william.get('firstName'),
            _id: { $ne: encodeToBase58(william.getId()) },
          },
        },
      )
      .resolves([leon.toJSON()]);

    dataProviderMock.fetchDPObjects
      .withArgs(
        stPacket.getDPContractId(),
        william.getType(),
        {
          where: {
            'document.$userId': william.get('$userId'),
            'document.lastName': william.get('lastName'),
            _id: { $ne: encodeToBase58(william.getId()) },
          },
        },
      )
      .resolves([leon.toJSON()]);

    dataProviderMock.fetchDPObjects
      .withArgs(
        stPacket.getDPContractId(),
        leon.getType(),
        {
          where: {
            'document.$userId': leon.get('$userId'),
            'document.firstName': leon.get('firstName'),
            _id: { $ne: encodeToBase58(leon.getId()) },
          },
        },
      )
      .resolves([william.toJSON()]);

    dataProviderMock.fetchDPObjects
      .withArgs(
        stPacket.getDPContractId(),
        leon.getType(),
        {
          where: {
            'document.$userId': leon.get('$userId'),
            'document.lastName': leon.get('lastName'),
            _id: { $ne: encodeToBase58(leon.getId()) },
          },
        },
      )
      .resolves([william.toJSON()]);

    const result = await verifyDPObjectsUniquenessByIndices(stPacket, userId, dpContract);

    expectValidationError(result, DuplicateDPObjectError, 4);

    const errors = result.getErrors();

    expect(errors.map(e => e.getDocument())).to.have.deep.members([
      william,
      william,
      leon,
      leon,
    ]);

    expect(errors.map(e => e.getIndexDefinition())).to.have.deep.members([
      indicesDefinition[0],
      indicesDefinition[1],
      indicesDefinition[0],
      indicesDefinition[1],
    ]);
  });
});