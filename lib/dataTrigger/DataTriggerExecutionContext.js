class DataTriggerExecutionContext {
  /**
   * @param {DataProvider} dataProvider
   * @param {string} ownerId
   * @param {DataContract} dataContract
   */
  constructor(dataProvider, ownerId, dataContract) {
    /**
     * @type {DataProvider}
     */
    this.dataProvider = dataProvider;
    this.ownerId = ownerId;
    this.dataContract = dataContract;
  }

  /**
   * @returns {DataProvider}
   */
  getDataProvider() {
    return this.dataProvider;
  }

  /**
   * @returns {string}
   */
  getOwnerId() {
    return this.ownerId;
  }

  /**
   * @returns {DataContract}
   */
  getDataContract() {
    return this.dataContract;
  }
}

module.exports = DataTriggerExecutionContext;
