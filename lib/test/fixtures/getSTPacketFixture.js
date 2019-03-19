const STPacket = require('../../stPacket/STPacket');

const getDPContractFixture = require('./getDPContractFixture');
const getDPObjectsFixture = require('./getDPObjectsFixture');

/**
 * @return {STPacket}
 */
function getSTPacketFixture() {
  const dpContract = getDPContractFixture();
  const documents = getDPObjectsFixture();

  return new STPacket(dpContract.getId(), documents);
}

module.exports = getSTPacketFixture;
