const Contract = require('../../contract/Contract');

/**
 * @return {Contract}
 */
module.exports = function getContractFixture() {
  const documents = {
    domain: {
      indices: [
        { properties: [{ hash: 'asc' }], unique: true },
      ],
      properties: {
        hash: {
          type: 'string',
        },
        label: {
          type: 'string',
          pattern: '',
        },
        normalizedLabel: {
          type: 'string',
        },
        parentDomainHash: {
          type: 'string',
        },
        preorderSalt: {
          type: 'string',
        },
        records: {
          type: 'object',
          properties: {
            dashIdentity: {
              type: 'string',
            },
          },
          minProperties: 1,
          additionalProperties: false,
        },
      },
      required: ['hash', 'label', 'normalizedLabel', 'parentDomainHash', 'preorderSalt', 'records'],
      additionalProperties: false,
    },
  };

  return new Contract('dpnsContract', documents);
};
