const TriggerResult = require('../TriggerResult');

/**
 * @return {Promise<TriggerResult>}
 */
async function updateDomainDataTrigger() {
  return new TriggerResult(
    false,
    'Update action is not allowed',
  );
}

module.exports = updateDomainDataTrigger;
