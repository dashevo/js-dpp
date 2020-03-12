const AbstractSubTransition = require('./AbstractSubTransition');

class ReplaceSubTransition extends AbstractSubTransition {
  /**
   * @param {RawReplaceSubTransition} rawSubTransition
   */
  constructor(rawSubTransition) {
    super();

    this.documentId = rawSubTransition.documentId;
    this.documentData = rawSubTransition.documentData;
  }

  /**
   * Get type
   *
   * @returns {string}
   */
  getType() {
    return AbstractSubTransition.TYPES.REPLACE;
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
   * Get document data
   *
   * @returns {Object}
   */
  getDocumentData() {
    return this.documentData;
  }

  /**
   * Get sub transition as a plain object
   *
   * @return {RawReplaceSubTransition}
   */
  toJSON() {
    return {
      ...this.toJSON(),
      documentId: this.documentId,
      documentData: this.documentData,
    };
  }
}

/**
 * @typedef {Object} RawReplaceSubTransition
 * @property {string} type
 * @property {string} documentId
 * @property {Object} documentData
 */

module.exports = ReplaceSubTransition;
