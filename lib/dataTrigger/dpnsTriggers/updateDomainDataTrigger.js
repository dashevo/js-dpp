const DataTriggerExecutionError = require('../../errors/DataTriggerExecutionError');
const Document = require('../../document/Document');
const DataTrigger = require('../DataTrigger');

/**
 * @param {Document} document
 * @param {DataTriggerExecutionContext} context
 * @return {Promise<void>}
 */
async function updateDomainDataTrigger(document, context) {
  throw new DataTriggerExecutionError(document, context, 'Update action is not allowed');
}

module.exports = new DataTrigger('domain', Document.ACTIONS.UPDATE, updateDomainDataTrigger);
