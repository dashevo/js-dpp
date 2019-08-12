/**
 * @typedef executeDataTriggers
 * @param {Document[]} documents
 * @param {DataTriggerExecutionContext} context
 * @return {Promise<DataTriggerExecutionResult[]>}
 */
async function executeDataTriggers(documents, context) {
  const contract = context.getContract();

  return documents.reduce((results, document) => {
    const dataTriggers = contract.getDataTriggers(document.getType(), document.getAction());

    dataTriggers.forEach(async (trigger) => {
      const result = await trigger.execute(document, context);

      results.push(result);
    });

    return results;
  }, []);
}

module.exports = executeDataTriggers;
