class DataIsNotAllowedWithActionDeleteError extends Error {
  /**
   * @param {Document} dpObject
   */
  constructor(dpObject) {
    super();

    this.dpObject = dpObject;
    this.message = 'Data is not allowed for objects with $action DELETE';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Get Document
   *
   * @returns {Document}
   */
  getDPObject() {
    return this.dpObject;
  }
}

module.exports = DataIsNotAllowedWithActionDeleteError;
