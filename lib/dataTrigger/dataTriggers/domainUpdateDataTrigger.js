const DataTriggerExecutionResult = require('../DataTriggerExecutionResult');
const DataTriggerExecutionError = require('../../errors/DataTriggerExecutionError');
const Document = require('../../document/Document');

/**
 * @param {Document} document
 * @param {DataTriggerExecutionContext} context
 * @return {Promise<DataTriggerExecutionResult>}
 */

async function domainUpdateDataTrigger(document, context) {
  const dataTriggerExecutionResult = new DataTriggerExecutionResult();

  if (document.getAction() === Document.ACTIONS.UPDATE) {
    dataTriggerExecutionResult.addError(
      new DataTriggerExecutionError(document, context, 'Update action is not allowed'),
    );

    return dataTriggerExecutionResult;
  }

  return dataTriggerExecutionResult;
}

module.exports = domainUpdateDataTrigger;
