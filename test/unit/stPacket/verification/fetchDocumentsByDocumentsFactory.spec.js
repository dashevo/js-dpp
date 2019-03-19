const bs58 = require('bs58');

const getDocumentsFixture = require('../../../../lib/test/fixtures/getDocumentsFixture');
const getDPContractFixture = require('../../../../lib/test/fixtures/getDPContractFixture');

const fetchDocumentsByDocumentsFactory = require('../../../../lib/stPacket/verification/fetchDocumentsByDocumentsFactory');

const createDataProviderMock = require('../../../../lib/test/mocks/createDataProviderMock');

function encodeToBase58(id) {
  const idBuffer = Buffer.from(id, 'hex');
  return bs58.encode(idBuffer);
}

describe('fetchDocumentsByDocuments', () => {
  let fetchDocumentsByDocuments;
  let dataProviderMock;
  let documents;
  let dpContract;

  beforeEach(function beforeEach() {
    dataProviderMock = createDataProviderMock(this.sinonSandbox);

    fetchDocumentsByDocuments = fetchDocumentsByDocumentsFactory(dataProviderMock);

    documents = getDocumentsFixture();
    dpContract = getDPContractFixture();
  });

  it('should fetch specified Documents using DataProvider', async () => {
    dataProviderMock.fetchDPObjects.withArgs(
      dpContract.getId(),
      documents[0].getType(),
    ).resolves([documents[0]]);

    dataProviderMock.fetchDPObjects.withArgs(
      dpContract.getId(),
      documents[1].getType(),
    ).resolves([documents[1], documents[2]]);

    dataProviderMock.fetchDPObjects.withArgs(
      dpContract.getId(),
      documents[3].getType(),
    ).resolves([documents[3], documents[4]]);

    const fetchedDocuments = await fetchDocumentsByDocuments(dpContract.getId(), documents);

    expect(dataProviderMock.fetchDPObjects).to.have.been.calledThrice();

    const callArgsOne = [
      dpContract.getId(),
      documents[0].getType(),
      {
        where: {
          _id: {
            $in: [encodeToBase58(documents[0].getId())],
          },
        },
      },
    ];

    const callArgsTwo = [
      dpContract.getId(),
      documents[1].getType(),
      {
        where: {
          _id: {
            $in: [
              encodeToBase58(documents[1].getId()),
              encodeToBase58(documents[2].getId()),
            ],
          },
        },
      },
    ];

    const callArgsThree = [
      dpContract.getId(),
      documents[3].getType(),
      {
        where: {
          _id: {
            $in: [
              encodeToBase58(documents[3].getId()),
              encodeToBase58(documents[4].getId()),
            ],
          },
        },
      },
    ];

    const callsArgs = [];
    for (let i = 0; i < dataProviderMock.fetchDPObjects.callCount; i++) {
      const call = dataProviderMock.fetchDPObjects.getCall(i);
      callsArgs.push(call.args);
    }

    expect(callsArgs).to.have.deep.members([
      callArgsOne,
      callArgsTwo,
      callArgsThree,
    ]);

    expect(fetchedDocuments).to.deep.equal(documents);
  });
});
