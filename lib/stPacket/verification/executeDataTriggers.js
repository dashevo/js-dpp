const getDataTriggers = require('../../dataTrigger/getDataTriggers');

/**
 * @typedef executeDataTriggers
 *
 * @param {Document[]} documents
 * @param {DataTriggerExecutionContext} context
 *
 * @return {Promise<DataTriggerExecutionResult[]>}
 */
async function executeDataTriggers(documents, context) {
  const contract = context.getContract();

  return documents.reduce((results, document) => {
    const dataTriggers = getDataTriggers(contract, document);

    dataTriggers.forEach(async (trigger) => {
      const result = await trigger.execute(context);

      results.push(result);
    });

    return results;
  }, []);
}

module.exports = executeDataTriggers;
