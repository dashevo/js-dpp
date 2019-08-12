const Document = require('../document/Document');

const DataTrigger = require('./DataTrigger');

const createDomainDataTrigger = require('./dpnsTriggers/createDomainDataTrigger');
const deleteDomainDataTrigger = require('./dpnsTriggers/deleteDomainDataTrigger');
const updateDomainDataTrigger = require('./dpnsTriggers/updateDomainDataTrigger');

/**
 * Get respective data triggers
 *
 * @param {Contract} contract
 * @param {Document} document
 *
 * @returns {DataTrigger[]}
 */
function getDataTriggers(contract, document) {
  if (contract.getId() === process.env.DPNS_CONTRACT_ID) {
    if (document.getType() === 'domain') {
      if (document.getAction() === Document.ACTIONS.CREATE) {
        return [
          new DataTrigger(contract, document, createDomainDataTrigger),
        ];
      }

      if (document.getAction() === Document.ACTIONS.UPDATE) {
        return [
          new DataTrigger(contract, document, updateDomainDataTrigger),
        ];
      }

      if (document.getAction() === Document.ACTIONS.DELETE) {
        return [
          new DataTrigger(contract, document, deleteDomainDataTrigger),
        ];
      }
    }
  }

  return [];
}

module.exports = getDataTriggers;
