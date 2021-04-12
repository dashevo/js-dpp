const DataTriggerConditionError = require('../../errors/DataTriggerConditionError');
const DataTriggerExecutionResult = require('../DataTriggerExecutionResult');

async function replaceFeatureFlagDataTrigger(documentTransition, context, topLevelIdentity) {
  const result = new DataTriggerExecutionResult();

  if (!context.getOwnerId().equals(topLevelIdentity)) {
    result.addError(
      new DataTriggerConditionError(
        documentTransition,
        context.getDataContract(),
        context.getOwnerId(),
        'This identity can\'t change selected feature flag status',
      ),
    );
  }

  return result;
}

module.exports = replaceFeatureFlagDataTrigger;