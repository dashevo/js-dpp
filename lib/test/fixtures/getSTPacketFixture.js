const STPacket = require('../../stPacket/STPacket');

const getContractFixture = require('./getDataContractFixture');
const getDocumentsFixture = require('./getDocumentsFixture');

/**
 * @return {STPacket}
 */
function getSTPacketFixture() {
  const contract = getContractFixture();
  const documents = getDocumentsFixture()
    .map(document => document.removeMetadata());

  return new STPacket(contract.getContractId(), documents);
}

module.exports = getSTPacketFixture;
