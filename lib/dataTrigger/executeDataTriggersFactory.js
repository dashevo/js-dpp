const DataTriggerExecutionContext = require('./DataTriggerExecutionContext');

/**
 * @param {Document[]} documents
 * @param {DataTriggerExecutionContext} context
 * @return {executeDataTriggers}
 */
function executeDataTriggersFactory(
  documents,
  context,
) {
  /**
   * @typedef executeDataTriggers
   * @returns {Promise<DataTriggerExecutionResult[]>}
   */
  return function executeDataTriggers() {
    const contract = context.getContract();

    return Promise.all(
      [].concat(...documents
        .map((document) => {
          const dataTriggers = contract.getDataTriggers(document.getType(), document.getAction());
          return dataTriggers
            .map(trigger => trigger.execute(document, context));
        })),
    );
  };
}

module.exports = executeDataTriggersFactory;
