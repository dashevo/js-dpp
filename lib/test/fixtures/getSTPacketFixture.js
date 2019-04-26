const STPacket = require('../../stPacket/STPacket');

const getContractFixture = require('./getContractFixture');
const getDocumentsFixture = require('./getDocumentsFixture');

/**
 * @return {STPacket}
 */
function getSTPacketFixture() {
  const contract = getContractFixture();
  const documents = getDocumentsFixture();

  documents.forEach((document) => {
    /* eslint-disable-next-line no-param-reassign */
    delete document.meta;
  });

  return new STPacket(contract.getId(), documents);
}

module.exports = getSTPacketFixture;
