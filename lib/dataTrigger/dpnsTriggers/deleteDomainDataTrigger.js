/**
 * Data trigger for domain deletion process
 *
 * @return {Promise<void>}
 */
async function deleteDomainDataTrigger() {
  throw new Error('Delete action is not allowed');
}

module.exports = deleteDomainDataTrigger;
