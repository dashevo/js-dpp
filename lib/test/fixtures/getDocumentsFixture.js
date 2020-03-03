const getDataContractFixture = require('./getDataContractFixture');

const DocumentFactory = require('../../document/DocumentFactory');

const generateRandomId = require('../utils/generateRandomId');

const ownerId = generateRandomId();

/**
 * @return {Document[]}
 */
module.exports = function getDocumentsFixture() {
  const dataContract = getDataContractFixture();

  const factory = new DocumentFactory(
    () => {},
    () => {},
  );

  return [
    factory.create(dataContract, ownerId, 'niceDocument', { name: 'Cutie' }),
    factory.create(dataContract, ownerId, 'prettyDocument', { lastName: 'Shiny' }),
    factory.create(dataContract, ownerId, 'prettyDocument', { lastName: 'Sweety' }),
    factory.create(dataContract, ownerId, 'indexedDocument', { firstName: 'William', lastName: 'Birkin' }),
    factory.create(dataContract, ownerId, 'indexedDocument', { firstName: 'Leon', lastName: 'Kennedy' }),
  ];
};

module.exports.ownerId = ownerId;
