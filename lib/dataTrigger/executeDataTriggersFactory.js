const DataTriggerExecutionContext = require('./DataTriggerExecutionContext');

/**
 * @param {Document[]} documents
 * @param {Contract} contract
 * @param {DataProvider} dataProvider
 * @param {string} userId
 * @return {executeDataTriggers}
 */
function executeDataTriggersFactory(documents, contract, dataProvider, userId) {
  /**
   * @typedef executeDataTriggers
   * @returns {DataTriggerExecutionResult[]}
   */
  return async function executeDataTriggers() {
    const dataTriggersExecutionContext = new DataTriggerExecutionContext(
      dataProvider,
      userId,
      contract,
    );
    const dataTriggers = contract.getDataTriggers();
    documents.map(document => Promise.all(dataTriggers.map(dataTrigger => dataTrigger(
      document,
      dataTriggersExecutionContext,
    ))));
  };
}

module.exports = executeDataTriggersFactory;
