class InvalidDPObjectActionError extends Error {
  /**
   * @param {Document} dpObject
   */
  constructor(dpObject) {
    super();

    this.name = this.constructor.name;
    this.message = 'Invalid DP Object action';
    this.dpObject = dpObject;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
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

module.exports = InvalidDPObjectActionError;
