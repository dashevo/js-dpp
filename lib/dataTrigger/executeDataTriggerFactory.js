const DataTriggerExecutionResult = require('./DataTriggerExecutionResult');

function executeDataTriggerFactory(contract, document) {
  return async function executeDataTrigger(document) {
    const result = new DataTriggerExecutionResult();
    return result;
  };
}

module.exports = executeDataTriggerFactory;
