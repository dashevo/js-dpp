const DataTriggerExecutionResult = require('../DataTriggerExecutionResult');
const DataTriggerExecutionError = require('../../errors/DataTriggerExecutionError');
const hash = require('../../util/hash');
const Document = require('../../document/Document');

/**
 * @typedef domainCreateDataTrigger
 * @param {Document} document
 * @param {DataTriggerExecutionContext} context
 * @return {Promise<DataTriggerExecutionResult>}
 */
async function domainCreateDataTrigger(document, context) {
  const dataTriggerExecutionResult = new DataTriggerExecutionResult();

  if (document.getType() !== 'domain') {
    dataTriggerExecutionResult.addError(
      new DataTriggerExecutionError(document, context, 'Document type is not domain'),
    );

    return dataTriggerExecutionResult;
  }

  if (document.getAction() !== Document.ACTIONS.CREATE) {
    dataTriggerExecutionResult.addError(
      new DataTriggerExecutionError(document, context, 'Document action is not create'),
    );

    return dataTriggerExecutionResult;
  }

  const documentData = document.getData();

  if (documentData.hash !== hash(Buffer.from(documentData.normalizedLabel)).toString('hex')) {
    dataTriggerExecutionResult.addError(
      new DataTriggerExecutionError(document, context, 'Document hash doesn\'t match actual hash'),
    );
  }

  if (documentData.normalizedLabel !== documentData.label.toLowerCase()) {
    dataTriggerExecutionResult.addError(
      new DataTriggerExecutionError(document, context, 'Normalized label doesn\'t match label'),
    );
  }

  const [parentDomain] = await context.dataProvider.fetchDocuments(
    context.contract.getId(),
    document.getType(),
    { where: ['hash', '==', documentData.parentDomainHash] },
  );

  if (!parentDomain || parentDomain.hash !== documentData.parentDomainHash) {
    dataTriggerExecutionResult.addError(
      new DataTriggerExecutionError(document, context, 'Can\'t find parent domain matching parent hash'),
    );
  }

  const fetchedTransaction = await context.dataProvider.fetchTransaction(
    documentData.records.dashIdentity,
  );

  if (fetchedTransaction === null) {
    dataTriggerExecutionResult.addError(
      new DataTriggerExecutionError(document, context, 'dashIdentity with corresponding id not found'),
    );
  }

  return dataTriggerExecutionResult;
}

module.exports = domainCreateDataTrigger;
