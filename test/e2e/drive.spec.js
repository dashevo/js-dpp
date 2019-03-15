const { startDrive } = require('@dashevo/dp-services-ctl');

const DashPlatformProtocol = require('../../lib/DashPlatformProtocol');

const registerUser = require('../../lib/test/utils/registerUser');
const sendSTPacket = require('../../lib/test/utils/sendSTPacket');
const createStateTransition = require('../../lib/test/utils/createStateTransition');

function delay(t, val) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(val);
    }, t);
  });
}

describe('drive', function main() {
  this.timeout(90000);

  let dpp;
  let drive;

  before(async () => {
    dpp = new DashPlatformProtocol();

    drive = await startDrive();

    // Activate Special Transactions
    await drive.dashCore.getApi().generate(1000);
  });

  it('should verify DP objects by correctly retrieving data from Drive', async () => {
    // Register a user
    const username = 'simpleBlockchainUser';

    const { userId, privateKeyString } = await registerUser(
      username,
      drive.dashCore.getApi(),
    );

    // Create the data contract
    const dpContract = dpp.contract.create('IndexedContract', {
      user: {
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
      userId,
      privateKeyString,
      dpContractPacket,
    );

    const { tsId: dpContractTsId } = await sendSTPacket(
      dpContractPacket,
      dpContractTransaction,
      drive.driveApi.getApi(),
      drive.dashCore.getApi(),
    );

    await delay(15000);

    // Create first user object
    dpp.setUserId(userId);

    const firstUserObject = dpp.object.create('user', {
      firstName: 'William',
      email: 'w.birkin@umbrella.co',
    });

    const firstUserPacket = dpp.packet.create([firstUserObject]);
    const firstUserTransaction = createStateTransition(
      userId,
      privateKeyString,
      firstUserPacket,
      dpContractTsId,
    );

    const { tsId: firstUserTsId } = await sendSTPacket(
      firstUserPacket,
      firstUserTransaction,
      drive.driveApi.getApi(),
      drive.dashCore.getApi(),
    );

    await delay(15000);

    // Create second user object
    const secondUserObject = dpp.object.create('user', {
      firstName: 'Annette',
      email: 'a.birkin@umbrella.co',
    });

    const secondUserPacket = dpp.packet.create([secondUserObject]);
    const secondUserTransaction = createStateTransition(
      userId,
      privateKeyString,
      secondUserPacket,
      firstUserTsId,
    );

    const { tsId: secondUserTsId } = await sendSTPacket(
      secondUserPacket,
      secondUserTransaction,
      drive.driveApi.getApi(),
      drive.dashCore.getApi(),
    );

    await delay(15000);

    // Create third user object violating unique indices
    const thirdUserObject = dpp.object.create('user', {
      firstName: 'Leon',
      email: 'a.birkin@umbrella.co',
    });

    const thirdUserPacket = dpp.packet.create([thirdUserObject]);
    const thirdUserTransaction = createStateTransition(
      userId,
      privateKeyString,
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
    } catch (e) {
      //
    }
  });

  after(async () => {
    await drive.remove();
  });
});
