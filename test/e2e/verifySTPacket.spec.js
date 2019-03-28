const { startDrive } = require('@dashevo/dp-services-ctl');

const DashPlatformProtocol = require('../../lib/DashPlatformProtocol');

const registerUser = require('../../lib/test/e2e/registerUser');
const sendSTPacket = require('../../lib/test/e2e/sendSTPacket');
const createStateTransition = require('../../lib/test/e2e/createStateTransition');
const isDriveSynced = require('../../lib/test/e2e/isDriveSynced');

describe('verifySTPacket', function main() {
  this.timeout(90000);

  let dpp;
  let drive;

  before(async () => {
    dpp = new DashPlatformProtocol();

    drive = await startDrive();

    // Activate Special Transactions
    await drive.dashCore.getApi().generate(1000);
  });

  it('should verify DP object uniqueness by indices by submitting correct queries to Drive', async () => {
    // Register a user
    const user = await registerUser(
      'simpleBlockchainUser',
      drive.dashCore.getApi(),
    );

    // Create the data contract
    const dpContract = dpp.contract.create('IndexedContract', {
      profile: {
        indices: [
          {
            properties: [
              { $userId: 'asc' },
              { firstName: 'desc' },
            ],
            unique: true,
          },
          {
            properties: [
              { $userId: 'asc' },
              { email: 'asc' },
            ],
            unique: true,
          },
        ],
        properties: {
          firstName: {
            type: 'string',
          },
          email: {
            type: 'string',
          },
        },
        required: ['firstName', 'email'],
        additionalProperties: false,
      },
    });

    dpp.setDPContract(dpContract);

    const dpContractPacket = dpp.packet.create(dpContract);

    const dpContractTransaction = createStateTransition(
      user,
      dpContractPacket,
    );

    const dpContractTsId = await sendSTPacket(
      dpContractPacket,
      dpContractTransaction,
      drive.driveApi.getApi(),
      drive.dashCore.getApi(),
    );

    await isDriveSynced(drive.driveApi.getApi());

    // Create first user object
    dpp.setUserId(user.getId());

    const firstUserObject = dpp.object.create('profile', {
      firstName: 'William',
      email: 'w.birkin@umbrella.co',
    });

    const firstUserPacket = dpp.packet.create([firstUserObject]);
    const firstUserTransaction = createStateTransition(
      user,
      firstUserPacket,
      dpContractTsId,
    );

    const firstUserTsId = await sendSTPacket(
      firstUserPacket,
      firstUserTransaction,
      drive.driveApi.getApi(),
      drive.dashCore.getApi(),
    );

    await isDriveSynced(drive.driveApi.getApi());

    // Create second user object
    const secondUserObject = dpp.object.create('profile', {
      firstName: 'Annette',
      email: 'a.birkin@umbrella.co',
    });

    const secondUserPacket = dpp.packet.create([secondUserObject]);
    const secondUserTransaction = createStateTransition(
      user,
      secondUserPacket,
      firstUserTsId,
    );

    const secondUserTsId = await sendSTPacket(
      secondUserPacket,
      secondUserTransaction,
      drive.driveApi.getApi(),
      drive.dashCore.getApi(),
    );

    await isDriveSynced(drive.driveApi.getApi());

    // Create third user object violating unique indices
    const thirdUserObject = dpp.object.create('profile', {
      firstName: 'Leon',
      email: 'a.birkin@umbrella.co',
    });

    const thirdUserPacket = dpp.packet.create([thirdUserObject]);
    const thirdUserTransaction = createStateTransition(
      user,
      thirdUserPacket,
      secondUserTsId,
    );

    try {
      await sendSTPacket(
        thirdUserPacket,
        thirdUserTransaction,
        drive.driveApi.getApi(),
        drive.dashCore.getApi(),
      );

      expect.fail('Duplicate object was successfully sent');
    } catch (e) {
      const error = e.originalError;
      expect(error.data[0].name).to.equal('DuplicateDPObjectError');
      expect(error.data[0].dpObject).to.deep.equal(thirdUserObject.toJSON());
      expect(error.data[0].indexDefinition).to.deep.equal({
        unique: true,
        properties: [
          { $userId: 'asc' },
          { email: 'asc' },
        ],
      });
    }
  });

  after(async () => {
    await drive.remove();
  });
});
