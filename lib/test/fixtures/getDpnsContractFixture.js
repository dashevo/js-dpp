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
        hash: { // Normalized and hashed domain name
          type: 'string',
        },
        label: { // The last segment of domain name
          type: 'string',
          pattern: '', // Regexp according to STD3 and STD13 - http://www.rfc-editor.org/std/std13.txt
        },
        normalzedLabel: { // just lowercase
          type: 'string',
        },
        parentDomainHash: { // Parent domain hash ('dash' in case of 'wallet.dash')
          type: 'string',
        },
        preorderSalt: {
          type: 'string',
        },
        records: {
          type: 'object',
          properties: {
            dashIdentity: { // RegTxId
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
