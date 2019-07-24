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
   * @returns {Promise<DataTriggerExecutionResult[]>}
   */
  return function executeDataTriggers() {
    const dataTriggersExecutionContext = new DataTriggerExecutionContext(
      dataProvider,
      userId,
      contract,
    );

    return Promise.all(
      [].concat(...documents
        .map((document) => {
          const dataTriggers = contract.getDataTriggers(document.getType(), document.getAction());
          return dataTriggers
            .map(trigger => trigger.execute(document, dataTriggersExecutionContext));
        })),
    );
  };
}

module.exports = executeDataTriggersFactory;
