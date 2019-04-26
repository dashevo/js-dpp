class Metadata {
  /**
   * Create document meta class
   *
   * @param {RawMetadata|undefined} rawMetadata
   */
  constructor(rawMetadata) {
    this.userId = (rawMetadata || {}).userId;
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
   * Get the JSON representation of the meta
   *
   * @returns {RawMetadata}
   */
  toJSON() {
    return {
      userId: this.userId,
    };
  }
}

module.exports = Metadata;
