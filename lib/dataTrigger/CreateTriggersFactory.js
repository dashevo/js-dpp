const DataTrigger = require('./DataTrigger.js');
const createDomainDataTrigger = require('./dpnsTriggers/createDomainDataTrigger');
const deleteDomainDataTrigger = require('./dpnsTriggers/deleteDomainDataTrigger');
const updateDomainDataTrigger = require('./dpnsTriggers/updateDomainDataTrigger');
const Document = require('../document/Document');

class CreateTriggersFactory {
  /**
   *
   * @param {Contract} contract
   * @returns {Array.<DataTrigger>}
   */
  constructor(contract) {
    return [
      new DataTrigger('domain', Document.ACTIONS.CREATE, createDomainDataTrigger, contract),
      new DataTrigger('domain', Document.ACTIONS.DELETE, deleteDomainDataTrigger, contract),
      new DataTrigger('domain', Document.ACTIONS.UPDATE, updateDomainDataTrigger, contract),
    ];
  }
}

module.exports = CreateTriggersFactory;
