class InvalidDPObjectStateError extends Error {
  /**
   * @param {number} errorCode
   * @param {DPObject} dpObject
   */
  constructor(errorCode, dpObject) {
    super();

    this.errorCode = errorCode;
    this.dpObject = dpObject;
    this.message = InvalidDPObjectStateError.MESSAGES[errorCode];

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Get error code
   *
   * @returns {number}
   */
  getErrorCode() {
    return this.errorCode;
  }

  /**
   * Get DPObject
   *
   * @returns {DPObject}
   */
  getDPObject() {
    return this.dpObject;
  }
}

InvalidDPObjectStateError.CODES = {
  DATA_IS_SET: -1,
  ACTION_IS_DELETE: -2,
};

InvalidDPObjectStateError.MESSAGES = {
  [InvalidDPObjectStateError.CODES.DATA_IS_SET]: 'DPObject data is already set',
  [InvalidDPObjectStateError.CODES.ACTION_IS_DELETE]: 'DPObject $action is DELETE',
};

module.exports = InvalidDPObjectStateError;
