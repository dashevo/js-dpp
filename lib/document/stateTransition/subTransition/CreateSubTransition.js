const AbstractSubTransition = require('./AbstractSubTransition');

class CreateSubTransition extends AbstractSubTransition {
  /**
   * @param {RawCreateSubTransition} rawSubTransition
   */
  constructor(rawSubTransition) {
    super();

    this.documentId = rawSubTransition.documentId;
    this.documentType = rawSubTransition.documentType;
    this.documentEntropy = rawSubTransition.documentEntropy;
    this.documentData = rawSubTransition.documentData;
  }

  /**
   * Get type
   *
   * @returns {string}
   */
  getType() {
    return AbstractSubTransition.TYPES.CREATE;
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
   * Get document type
   *
   * @returns {string}
   */
  getDocumentType() {
    return this.documentType;
  }

  /**
   * Get document entropy
   *
   * @returns {string}
   */
  getDocumentEntropy() {
    return this.documentEntropy;
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
   * @return {RawCreateSubTransition}
   */
  toJSON() {
    return {
      ...super.toJSON(),
      documentId: this.documentId,
      documentType: this.documentType,
      documentEntropy: this.documentEntropy,
      documentData: this.documentData,
    };
  }
}

/**
 * @typedef {Object} RawCreateSubTransition
 * @property {string} type
 * @property {string} documentId
 * @property {string} documentType
 * @property {string} documentEntropy
 * @property {Object} documentData
 */

module.exports = CreateSubTransition;
