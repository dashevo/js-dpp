const multihash = require('../../util/multihash');

/**
 * Data trigger for domain creation process
 *
 * @param {Document} document
 * @param {DataTriggerExecutionContext} context
 *
 * @return {Promise<void>}
 */
async function createDomainDataTrigger(document, context) {
  const {
    hash, normalizedLabel, label, parentDomainHash, records, preorderSalt,
  } = document.getData();

  if (hash !== multihash(Buffer.from(normalizedLabel)).toString('hex')) {
    throw new Error('Document hash doesn\'t match actual hash');
  }

  if (normalizedLabel !== label.toLowerCase()) {
    throw new Error('Normalized label doesn\'t match label');
  }

  const [parentDomainForHash] = await context.getDataProvider().fetchDocuments(
    context.getContract().getId(),
    document.getType(),
    { where: ['hash', '==', parentDomainHash] },
  );

  if (!parentDomainForHash) {
    throw new Error('Can\'t find parent domain matching parent hash');
  }

  const fetchedTransaction = await context.getDataProvider().fetchTransaction(
    records.dashIdentity,
  );

  if (fetchedTransaction === null) {
    throw new Error('dashIdentity with corresponding id not found');
  }

  if (context.getUserId() !== document.getData().records.dashIdentity) {
    throw new Error('userId doesn\'t match dashIdentity');
  }

  const saltedDomainHash = multihash(Buffer.from(preorderSalt + hash, 'hex')).toString('hex');
  const [preorderDocument] = await context.getDataProvider()
    .fetchDocuments(
      context.getContract().getId(),
      'preorder',
      { where: ['saltedDomainHash', '==', saltedDomainHash] },
    );

  if (!preorderDocument) {
    throw new Error('preorderDocument was not found');
  }

  const isHashValid = multihash.validate(Buffer.from(hash, 'hex'));

  if (!isHashValid) {
    throw new Error('hash is not valid');
  }

  const isParentDomainHash = multihash.validate(Buffer.from(hash, 'hex'));

  if (!isParentDomainHash) {
    throw new Error('isParentDomainHash is not valid');
  }
}

module.exports = createDomainDataTrigger;
