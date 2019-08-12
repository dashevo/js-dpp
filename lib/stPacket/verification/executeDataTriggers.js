/**
 * @typedef executeDataTriggers
 *
 * @param {Document[]} documents
 * @param {DataTriggerExecutionContext} context
 * @param {getDataTriggers} getDataTriggers
 *
 * @return {Promise<DataTriggerExecutionResult[]>}
 */
async function executeDataTriggers(documents, context, getDataTriggers) {
  const contractId = context.getContract().getId();

  return Promise.all(
    [].concat(...documents
      .map((document) => {
        const dataTriggers = getDataTriggers(contractId, document.getType(), document.getAction());

        return dataTriggers
          .map(trigger => trigger.execute(document, context));
      })),
  );
}

module.exports = executeDataTriggers;
