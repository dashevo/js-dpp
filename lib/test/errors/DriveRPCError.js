class DriveRPCError extends Error {
  /**
   * @param {object} originalError
   */
  constructor(originalError) {
    super();
    this.originalError = originalError;
  }

  /**
   * Get original RPC error returned by Drive
   * @returns {object}
   */
  getOriginalError() {
    return this.originalError;
  }
}

module.exports = DriveRPCError;
