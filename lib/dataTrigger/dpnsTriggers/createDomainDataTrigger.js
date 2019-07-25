const DataTriggerExecutionError = require('../../errors/DataTriggerExecutionError');
const calculateHash = require('../../util/hash');
const Document = require('../../document/Document');
const DataTrigger = require('../DataTrigger');

/**
 * @param {Document} document
 * @param {DataTriggerExecutionContext} context
 * @return {Promise<boolean>}
 */
async function createDomainDataTrigger(document, context) {
  const {
    hash, normalizedLabel, label, parentDomainHash, records,
  } = document.getData();

  if (hash !== calculateHash(Buffer.from(normalizedLabel)).toString('hex')) {
    throw new DataTriggerExecutionError(document, context, 'Document hash doesn\'t match actual hash');
  }

  if (normalizedLabel !== label.toLowerCase()) {
    throw new DataTriggerExecutionError(document, context, 'Normalized label doesn\'t match label');
  }

  const [parentDomain] = await context.dataProvider.fetchDocuments(
    context.contract.getId(),
    document.getType(),
    { where: ['hash', '==', parentDomainHash] },
  );

  if (!parentDomain || parentDomain.hash !== parentDomainHash) {
    throw new DataTriggerExecutionError(document, context, 'Can\'t find parent domain matching parent hash');
  }

  const fetchedTransaction = await context.dataProvider.fetchTransaction(
    records.dashIdentity,
  );

  if (fetchedTransaction === null) {
    throw new DataTriggerExecutionError(document, context, 'dashIdentity with corresponding id not found');
  }

  return true;
}

module.exports = new DataTrigger('domain', Document.ACTIONS.CREATE, createDomainDataTrigger);
