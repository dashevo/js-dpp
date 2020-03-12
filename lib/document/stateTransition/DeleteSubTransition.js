class DeleteSubTransition {
  /**
   * @param {string} documentId
   */
  constructor(documentId) {
    this.documentId = documentId;
  }

  /**
   * Get document id
   *
   * @returns {string}
   */
  getDocumentId() {
    return this.documentId;
  }

  /**
   * Get sub transition as a plain object
   *
   * @return {RawDeleteSubTransition}
   */
  toJSON() {
    return {
      ...super.toJSON(),
      documentId: this.documentId,
    };
  }
}

/**
 * @typedef {Object} RawDeleteSubTransition
 * @property {string} type
 * @property {string} documentId
 */

module.exports = DeleteSubTransition;
