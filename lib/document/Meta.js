class Meta {
  /**
   * Create document meta class
   * @param {string} userId
   */
  constructor(userId) {
    this.userid = userId;
  }

  /**
   * Get user id
   * @returns {string}
   */
  getUserId() {
    return this.userid;
  }

  /**
   * Get the JSON representation of the meta
   * @returns {RawDocumentMeta}
   */
  toJSON() {
    return {
      userId: this.userid,
    };
  }
}

module.exports = Meta;
