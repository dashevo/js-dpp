const ConsensusError = require('./ConsensusError');

const Document = require('../document/Document');

class DPObjectNotFoundError extends ConsensusError {
  /**
   * @param {Document} dpObject
   */
  constructor(dpObject) {
    const noun = {
      [Document.ACTIONS.UPDATE]: 'Updated',
      [Document.ACTIONS.DELETE]: 'Deleted',
    };

    super(`${noun[dpObject.getAction()]} Document not found`);

    this.dpObject = dpObject;
  }

  /**
   * Get Document
   *
   * @return {Document}
   */
  getDPObject() {
    return this.dpObject;
  }
}

module.exports = DPObjectNotFoundError;
