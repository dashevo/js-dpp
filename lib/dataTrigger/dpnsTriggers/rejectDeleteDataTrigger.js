const DataTriggerExecutionResult = require('../DataTriggerExecutionResult');
const DataTriggerConditionError = require('../../errors/DataTriggerConditionError');

/**
 * Data trigger for domain deletion process
 *
 * @param {DocumentDeleteTransition} documentTransition
 * @param {DataTriggerExecutionContext} context
 *
 * @return {Promise<DataTriggerExecutionResult>}
 */
async function rejectDeleteDataTrigger(documentTransition, context) {
  const result = new DataTriggerExecutionResult();

  result.addError(
    new DataTriggerConditionError(
      documentTransition,
      context.getDataContract(),
      context.getOwnerId(),
      'Delete action is not allowed',
    ),
  );

  return result;
}

module.exports = rejectDeleteDataTrigger;
