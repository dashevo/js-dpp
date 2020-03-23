const AbstractStateTransitionIdentitySigned = require('../../stateTransition/AbstractStateTransitionIdentitySigned');
const stateTransitionTypes = require('../../stateTransition/stateTransitionTypes');

class DocumentsStateTransition extends AbstractStateTransitionIdentitySigned {
  /**
   * @param {Document[]} documents
   */
  constructor(documents) {
    super();

    this.setDocuments(documents);
  }

  /**
   * Get State Transition type
   *
   * @return {number}
   */
  getType() {
    return stateTransitionTypes.DOCUMENTS;
  }

  /**
   * Get Documents
   *
   * @return {Document[]}
   */
  getDocuments() {
    return this.documents;
  }

  /**
   * Set Documents
   *
   * @param {Document[]} documents
   * @return {DocumentsStateTransition}
   */
  setDocuments(documents) {
    this.documents = documents;

    return this;
  }

  /**
   * Get Documents State Transition as plain object
   *
   * @param {Object} [options]
   * @return {RawDocumentsStateTransition}
   */
  toJSON(options = {}) {
    const documents = this.getDocuments();

    return {
      ...super.toJSON(options),
      actions: documents.map((d) => d.getAction()),
      documents: documents.map((d) => d.toJSON()),
    };
  }

  /**
   * Get owner ID
   * @return {string}
   */
  getOwnerId() {
    return this.getDocuments()[0].getOwnerId();
  }
}

module.exports = DocumentsStateTransition;
