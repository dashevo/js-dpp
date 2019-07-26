/**
 * @param {Document[]} documents
 * @param {DataTriggerExecutionContext} context
 * @return {Promise<DataTriggerExecutionResult[]>}
 */
function executeDataTriggers(documents, context) {
  const contract = context.getContract();

  return Promise.all(
    [].concat(...documents
      .map((document) => {
        const dataTriggers = contract.getDataTriggers(document.getType(), document.getAction());
        return dataTriggers
          .map(trigger => trigger.execute(document, context));
      })),
  );
}

module.exports = executeDataTriggers;
