const { Transaction, PrivateKey } = require('@dashevo/dashcore-lib');
const entropy = require('../../../lib/util/entropy');
const multihash = require('../../../lib/util/multihash');
const getDpnsContractFixture = require('./getDpnsContractFixture');
const DocumentFactory = require('../../document/DocumentFactory');

const transaction = new Transaction().setType(Transaction.TYPES.TRANSACTION_SUBTX_REGISTER);
transaction.extraPayload.setUserName('MyUser').setPubKeyIdFromPrivateKey(new PrivateKey());

const userId = transaction.hash;

/**
 * @return {Document}
 */
function getParentDocumentFixture(options = {}) {
  const contract = getDpnsContractFixture();

  const validateDocumentStub = () => {};

  const factory = new DocumentFactory(
    userId,
    contract,
    validateDocumentStub,
  );

  const label = options.label || 'Parent';
  const normalizedLabel = options.normalizedLabel || label.toLowerCase();
  const data = Object.assign({}, {
    hash: multihash(Buffer.from(normalizedLabel)).toString('hex'),
    label,
    normalizedLabel,
    normalizedParentDomainName: 'grandparent',
    preorderSalt: entropy.generate(),
    records: {
      dashIdentity: transaction.hash,
    },
  }, options);

  return factory.create('domain', data);
}

/**
 * @return {Document}
 */
function getChildDocumentFixture(options = {}) {
  const contract = getDpnsContractFixture();

  const validateDocumentStub = () => {};

  const factory = new DocumentFactory(
    userId,
    contract,
    validateDocumentStub,
  );

  const label = options.label || 'Child';
  const normalizedLabel = options.normalizedLabel || label.toLowerCase();
  const parent = getParentDocumentFixture();
  const data = Object.assign({}, {
    hash: multihash(Buffer.from(normalizedLabel)).toString('hex'),
    label,
    normalizedLabel,
    normalizedParentDomainName: parent.getData().normalizedLabel,
    preorderSalt: entropy.generate(),
    records: {
      dashIdentity: transaction.hash,
    },
  }, options);

  return factory.create('domain', data);
}

module.exports = {
  getParentDocumentFixture,
  getChildDocumentFixture,
};
