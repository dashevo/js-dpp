const STPacket = require('../../stPacket/STPacket');

const getContractFixture = require('./getContractFixture');
const getDocumentsFixture = require('./getDocumentsFixture');

/**
 * @return {STPacket}
 */
function getSTPacketFixture() {
  const dpContract = getContractFixture();
  const documents = getDocumentsFixture();

  return new STPacket(dpContract.getId(), documents);
}

module.exports = getSTPacketFixture;
