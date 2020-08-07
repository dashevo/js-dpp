const getDataContractFixture = require('./getDataContractFixture');

const DocumentFactory = require('../../document/DocumentFactory');

const generateRandomId = require('../utils/generateRandomId');

const ownerId = generateRandomId();

/**
 * @param {DataContract} [dataContract]
 * @return {Document[]}
 */
module.exports = function getDocumentsFixture(dataContract = getDataContractFixture()) {
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
    factory.create(dataContract, ownerId, 'noTimeDocument', { name: 'ImOutOfTime' }),
    factory.create(dataContract, ownerId, 'uniqueDates', { firstName: 'John' }),
    factory.create(dataContract, ownerId, 'indexedDocument', { firstName: 'Bill' }),
    factory.create(dataContract, ownerId, 'withContentEncoding', { binaryField: Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) }),
  ];
};

module.exports.ownerId = ownerId;
