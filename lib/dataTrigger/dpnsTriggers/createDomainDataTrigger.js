const multihash = require('../../util/multihash');
const TriggerResult = require('../TriggerResult');

/**
 * @param {Document} document
 * @param {DataTriggerExecutionContext} context
 * @return {Promise<TriggerResult>}
 */
async function createDomainDataTrigger(document, context) {
  const {
    hash, normalizedLabel, label, parentDomainHash, records, preorderSalt,
  } = document.getData();

  const triggerResult = new TriggerResult(
    false,
    '',
  );

  if (hash !== multihash(Buffer.from(normalizedLabel)).toString('hex')) {
    triggerResult.setMessage('Document hash doesn\'t match actual hash');

    return triggerResult;
  }

  if (normalizedLabel !== label.toLowerCase()) {
    triggerResult.setMessage('Normalized label doesn\'t match label');

    return triggerResult;
  }

  const [parentDomainForHash] = await context.getDataProvider().fetchDocuments(
    context.getContract().getId(),
    document.getType(),
    { where: ['hash', '==', parentDomainHash] },
  );

  if (!parentDomainForHash || parentDomainForHash.hash !== parentDomainHash) {
    triggerResult.setMessage('Can\'t find parent domain matching parent hash');

    return triggerResult;
  }

  const fetchedTransaction = await context.getDataProvider().fetchTransaction(
    records.dashIdentity,
  );

  if (fetchedTransaction === null) {
    triggerResult.setMessage('dashIdentity with corresponding id not found');

    return triggerResult;
  }

  if (context.getUserId() !== document.getData().records.dashIdentity) {
    triggerResult.setMessage('userId doesn\'t match dashIdentity');

    return triggerResult;
  }

  const saltedDomainHash = multihash(Buffer.from(preorderSalt + hash, 'hex')).toString('hex');
  const [preorderDocument] = await context.getDataProvider()
    .fetchDocuments(
      context.getContract().getId(),
      'preorder',
      { where: ['saltedDomainHash', '==', saltedDomainHash] },
    );

  if (!preorderDocument) {
    triggerResult.setMessage('preorderDocument not found');

    return triggerResult;
  }

  const [parentDomainForLabel] = await context.getDataProvider().fetchDocuments(
    context.getContract().getId(),
    document.getType(),
    { where: ['normalizedLabel', '==', normalizedLabel] },
  );
  if (parentDomainForLabel && parentDomainForLabel.hash === parentDomainHash) {
    triggerResult.setMessage('label is not uniq');

    return triggerResult;
  }

  const isHashValid = multihash.validate(Buffer.from(hash, 'hex'));

  if (!isHashValid) {
    triggerResult.setMessage('hash is not valid');

    return triggerResult;
  }

  const isParentDomainHash = multihash.validate(Buffer.from(hash, 'hex'));

  if (!isParentDomainHash) {
    triggerResult.setMessage('isParentDomainHash is not valid');

    return triggerResult;
  }

  triggerResult.setResult(true);

  return triggerResult;
}

module.exports = createDomainDataTrigger;
