const { Transaction, PrivateKey } = require('@dashevo/dashcore-lib');
const entropy = require('../../../lib/util/entropy');
const hash = require('../../../lib/util/hash');
const getDpnsContractFixture = require('./getDpnsContractFixture');
const DocumentFactory = require('../../document/DocumentFactory');

const userId = '6b74011f5d2ad1a8d45b71b9702f54205ce75253593c3cfbba3fdadeca278288';

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

  const transaction = new Transaction().setType(Transaction.TYPES.TRANSACTION_SUBTX_REGISTER);
  transaction.extraPayload.setUserName('MyUser').setPubKeyIdFromPrivateKey(new PrivateKey());
  const label = options.label || 'Parent';
  const normalizedLabel = options.normalizedLabel || label.toLowerCase();
  const data = Object.assign({}, {
    hash: hash(Buffer.from(normalizedLabel)).toString('hex'),
    label,
    normalizedLabel,
    parentDomainHash: hash(Buffer.from('GrandParent')).toString('hex'),
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

  const transaction = new Transaction().setType(Transaction.TYPES.TRANSACTION_SUBTX_REGISTER);
  transaction.extraPayload.setUserName('MyUser').setPubKeyIdFromPrivateKey(new PrivateKey());
  const label = options.label || 'Child';
  const normalizedLabel = options.normalizedLabel || label.toLowerCase();
  const parent = getParentDocumentFixture();
  const data = Object.assign({}, {
    hash: hash(Buffer.from(normalizedLabel)).toString('hex'),
    label,
    normalizedLabel,
    parentDomainHash: parent.getData().hash,
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
