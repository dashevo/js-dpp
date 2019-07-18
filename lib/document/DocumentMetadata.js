class DocumentMetadata {
  /**
   * Create document meta class
   *
   * @param {RawDocumentMetadata} rawDocumentMetadata
   */
  constructor(rawDocumentMetadata) {
    if (Object.prototype.hasOwnProperty.call(rawDocumentMetadata, 'userId')) {
      this.userId = rawDocumentMetadata.userId;
    }

    if (Object.prototype.hasOwnProperty.call(rawDocumentMetadata, 'reference')) {
      this.reference = rawDocumentMetadata.reference;
    }
  }

  /**
   * Get user ID
   *
   * @returns {string}
   */
  getUserId() {
    return this.userId;
  }

  /**
   * Get raw reference
   *
   * @returns {RawReference}
   */
  getReference() {
    return this.reference;
  }

  /**
   * Get the JSON representation of the meta
   *
   * @returns {RawDocumentMetadata}
   */
  toJSON() {
    const json = {
      userId: this.userId,
    };

    if (this.reference) {
      json.reference = this.reference;
    }

    return json;
  }
}

module.exports = DocumentMetadata;
