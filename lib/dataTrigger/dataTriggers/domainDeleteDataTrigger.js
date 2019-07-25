const DataTriggerExecutionResult = require('../DataTriggerExecutionResult');
const DataTriggerExecutionError = require('../../errors/DataTriggerExecutionError');
const Document = require('../../document/Document');

/**
 * @param {Document} document
 * @param {DataTriggerExecutionContext} context
 * @return {Promise<DataTriggerExecutionResult>}
 */
async function domainDeleteDataTrigger(document, context) {
  const dataTriggerExecutionResult = new DataTriggerExecutionResult();

  if (document.getAction() === Document.ACTIONS.DELETE) {
    dataTriggerExecutionResult.addError(
      new DataTriggerExecutionError(document, context, 'Delete action is not allowed'),
    );

    return dataTriggerExecutionResult;
  }

  return dataTriggerExecutionResult;
}

module.exports = domainDeleteDataTrigger;
