const DataTriggerExecutionResult = require('../DataTriggerExecutionResult');
const DataTriggerExecutionError = require('../../errors/DataTriggerExecutionError');
const Document = require('../../document/Document');

/**
 * @typedef trigger
 * @param {Document} document
 * @param {DataTriggerExecutionContext} [context]
 * @return {Promise<DataTriggerExecutionResult>}
 */

async function domainUpdateDataTrigger(document) {
  const dataTriggerExecutionResult = new DataTriggerExecutionResult();

  if (document.getType() !== 'domain') {
    dataTriggerExecutionResult.addError(
      new DataTriggerExecutionError('Document type is not domain'),
    );

    return dataTriggerExecutionResult;
  }

  if (document.getAction() === Document.ACTIONS.DELETE) {
    dataTriggerExecutionResult.addError(
      new DataTriggerExecutionError('Update action is not allowed'),
    );

    return dataTriggerExecutionResult;
  }

  return dataTriggerExecutionResult;
}

module.exports = domainUpdateDataTrigger;
