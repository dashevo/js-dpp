const generateRandomId = require('../utils/generateRandomId');

const DataContractFactory = require('../../dataContract/DataContractFactory');

/**
 *
 * @param {string} [ownerId]
 * @return {DataContract}
 */
module.exports = function getDataContractFixture(ownerId = undefined) {
  const dataContractOwnerId = ownerId || generateRandomId();

  const documents = {
    niceDocument: {
      properties: {
        name: {
          type: 'string',
        },
      },
      additionalProperties: false,
    },
    prettyDocument: {
      properties: {
        lastName: {
          $ref: '#/definitions/lastName',
        },
      },
      required: ['lastName'],
      additionalProperties: false,
    },
    indexedDocument: {
      indices: [
        {
          properties: [
            { $ownerId: 'asc' },
            { firstName: 'desc' },
          ],
          unique: true,
        },
        {
          properties: [
            { $ownerId: 'asc' },
            { lastName: 'desc' },
          ],
          unique: true,
        },
        {
          properties: [
            { $id: 'asc' },
            { lastName: 'asc' },
          ],
        },
      ],
      properties: {
        firstName: {
          type: 'string',
        },
        lastName: {
          type: 'string',
        },
      },
      required: ['firstName'],
      additionalProperties: false,
    },
  };

  const factory = new DataContractFactory(
    () => {},
  );

  const dataContract = factory.create(dataContractOwnerId, documents);

  dataContract.setDefinitions({
    lastName: {
      type: 'string',
    },
  });

  return dataContract;
};
