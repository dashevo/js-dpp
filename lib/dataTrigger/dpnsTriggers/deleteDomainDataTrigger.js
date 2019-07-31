const TriggerResult = require('../TriggerResult');

/**
 * @return {Promise<TriggerResult>}
 */
async function deleteDomainDataTrigger() {
  return new TriggerResult(
    false,
    'Delete action is not allowed',
  );
}

module.exports = deleteDomainDataTrigger;
