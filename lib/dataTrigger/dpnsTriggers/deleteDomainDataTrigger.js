const DataTriggerExecutionResult = require('../DataTriggerExecutionResult');
const DataTriggerExecutionError = require('../../errors/DataTriggerExecutionError');
const Document = require('../../document/Document');
const DataTrigger = require('../DataTrigger');

/**
 * @param {Document} document
 * @param {DataTriggerExecutionContext} context
 * @return {Promise<DataTriggerExecutionResult>}
 */
async function deleteDomainDataTrigger(document, context) {
  return new DataTriggerExecutionResult([
    new DataTriggerExecutionError(document, context, 'Delete action is not allowed'),
  ]);
}

module.exports = new DataTrigger('domain', Document.ACTIONS.DELETE, deleteDomainDataTrigger);
