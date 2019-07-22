/**
 * Data trigger function
 *
 * @callback trigger
 * @param {Document} document
 * @param {DataTriggerExecutionContext} context
 * @return {Promise<DataTriggerExecutionResult>}
 */

/**
 *
 * @param {trigger} trigger
 * @param {Document} document
 * @param {DataTriggerExecutionContext} context
 */
function dataTriggerFactory(trigger, document, context) {
  return async function dataTrigger() {
    return trigger(document, context);
  };
}

module.exports = dataTriggerFactory;
