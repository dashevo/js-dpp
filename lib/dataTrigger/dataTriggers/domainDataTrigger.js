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

  if (rawDocument.hash !== hash(rawDocument.normalzedLabel)) {
    dataTriggerExecutionResult.addError(
      new DataTriggerExecutionError(),
    );
  }

  if (rawDocument.normalzedLabel !== rawDocument.label.toLowerCase()) {
    dataTriggerExecutionResult.addError(
      new DataTriggerExecutionError(),
    );
  }

  const [fetchedDocument] = await context.dataProvider.fetchDocuments(
    context.contract.getId(),
    document.getType(),
    { where: ['hash', '==', rawDocument.parentDomainHash] },
  );

  if (!fetchedDocument || fetchedDocument.hash !== rawDocument.parentDomainHash) {
    dataTriggerExecutionResult.addError(
      new DataTriggerExecutionError(),
    );
  }

  const fetchedTransaction = await context.dataProvider.fetchTransaction(
    rawDocument.records.dashIdentity
  );

  if (fetchedTransaction === null) {
    dataTriggerExecutionResult.addError(
      new DataTriggerExecutionError(),
    );
  }


  return dataTriggerExecutionResult;
}

module.exports = domainDataTrigger;
