const DataTriggerExecutionResult = require('../DataTriggerExecutionResult');
const DataTriggerExecutionError = require('../../errors/DataTriggerExecutionError');
const hash = require('../../util/hash');

/**
 * @typedef trigger
 * @param {Document} document
 * @param {DataTriggerExecutionContext} context
 * @return {Promise<DataTriggerExecutionResult>}
 */
async function domainDataTrigger(document, context) {
  const rawDocument = document.getData();
  const dataTriggerExecutionResult = new DataTriggerExecutionResult();

  if (rawDocument.hash !== hash(Buffer.from(rawDocument.normalizedLabel)).toString('hex')) {
    dataTriggerExecutionResult.addError(
      new DataTriggerExecutionError('Document hash doesn\'t match actual hash'),
    );
  }

  if (rawDocument.normalizedLabel !== rawDocument.label.toLowerCase()) {
    dataTriggerExecutionResult.addError(
      new DataTriggerExecutionError('Normalized label doesn\'t match label'),
    );
  }

  const [parentDomain] = await context.dataProvider.fetchDocuments(
    context.contract.getId(),
    document.getType(),
    { where: ['hash', '==', rawDocument.parentDomainHash] },
  );

  if (!parentDomain || parentDomain.hash !== rawDocument.parentDomainHash) {
    dataTriggerExecutionResult.addError(
      new DataTriggerExecutionError('Can\'t find parent domain matching parent hash'),
    );
  }

  const fetchedTransaction = await context.dataProvider.fetchTransaction(
    rawDocument.records.dashIdentity,
  );

  if (fetchedTransaction === null) {
    dataTriggerExecutionResult.addError(
      new DataTriggerExecutionError('dashIdentity with corresponding id not found'),
    );
  }

  return dataTriggerExecutionResult;
}

module.exports = domainDataTrigger;
