const getDpnsContractFixture = require('./getDpnsContractFixture');

const DocumentFactory = require('../../document/DocumentFactory');

const userId = '6b74011f5d2ad1a8d45b71b9702f54205ce75253593c3cfbba3fdadeca278288';

/**
 * @return {Document}
 */
module.exports = function getDocumentsFixture() {
  const contract = getDpnsContractFixture();

  const validateDocumentStub = () => {};

  const factory = new DocumentFactory(
    userId,
    contract,
    validateDocumentStub,
  );

  return factory.create('dpnsDocument', {
    hash: '4c120f88909c996eb9def217d0edda5fb23f7a723c30ebee2598d404c6c65abf',
    label: 'MyLabel',
    normalzedLabel: 'mylabel',
    parentDomainHash: '4c120f88909c996eb9def217d0edda5fb23f7a723c30ebee2598d404c6c65abf',
    preorderSalt: '!@#',
    records: {
      dashIdentity: '4c120f88909c996eb9def217d0edda5fb23f7a723c30ebee2598d404c6c65abf',
    },
  });
};
