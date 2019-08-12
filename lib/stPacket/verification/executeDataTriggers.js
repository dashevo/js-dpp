/**
 * Execute data triggers for a document sequentially
 *
 * @param {Document} document
 * @param {DataTrigger[]} dataTriggers
 * @param {DataTriggerExecutionContext} context
 * @param {DataTriggerExecutionResult[]} results
 *
 * @return {Promise<DataTriggerExecutionResult>}
 */
async function executeTriggersSequentially(document, dataTriggers, context, results) {
  dataTriggers.reduce(async (previousPromise, dataTrigger) => {
    const result = await previousPromise;
    if (result) {
      results.push(result);
    }
    return dataTrigger.execute(document, context);
  }, Promise.resolve());
}

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

  const results = [];

  documents.reduce(async (previousPromise, document) => {
    await previousPromise;

    const dataTriggers = getDataTriggers(contractId, document.getType(), document.getAction());

    return executeTriggersSequentially(document, dataTriggers, context, results);
  }, Promise.resolve());

  return results;
}

module.exports = executeDataTriggers;
