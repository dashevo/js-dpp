const { startDrive } = require('@dashevo/dp-services-ctl');

const {
  StartTransactionRequest,
  ApplyStateTransitionRequest,
  CommitTransactionRequest,
} = require('@dashevo/drive-grpc');

const DataContractStateTrnsition = require(
  '../../lib/dataContract/stateTransition/DataContractStateTransition',
);

const getDataContractFixture = require('../../lib/test/fixtures/getDataContractFixture');
const getDocumentsFixture = require('../../lib/test/fixtures/getDocumentsFixture');

describe('validateStateTransition', function main() {
  this.timeout(180000);

  let driveInstance;

  let driveApi;
  let driveUpdateStateApi;

  let dataContract;

  async function withinTransaction(call) {
    const blockHeight = 0;
    const blockHash = Buffer.alloc(16, 0);

    const startRequest = new StartTransactionRequest();
    startRequest.setBlockHeight(blockHeight);

    await driveUpdateStateApi.startTransaction(startRequest);

    await call(
      blockHeight,
      blockHash,
    );

    const commitRequest = new CommitTransactionRequest();
    commitRequest.setBlockHeight(blockHeight);
    commitRequest.setBlockHash(blockHash);

    await driveUpdateStateApi.commitTransaction(commitRequest);
  }

  beforeEach(async () => {
    driveInstance = await startDrive();

    driveApi = driveInstance.driveApi.getApi();
    driveUpdateStateApi = driveInstance.driveUpdateState.getApi();

    dataContract = getDataContractFixture();
  });

  it('should not validate contract state transition without a blockchain user', async () => {
    const stateTransition = new DataContractStateTrnsition(dataContract);

    await withinTransaction(async (blockHeight, blockHash) => {
      const request = new ApplyStateTransitionRequest();
      request.setStateTransition(stateTransition.serialize());
      request.setBlockHeight(blockHeight);
      request.setBlockHash(blockHash);

      try {
        await driveUpdateStateApi.applyStateTransition(request);
        expect.fail('Error was not thrown');
      } catch (e) {
        expect(e.message).to.equal('Invalid State Transition');
      }
    });
  });

  afterEach(async () => {});
});
