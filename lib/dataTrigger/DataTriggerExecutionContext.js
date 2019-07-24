class DataTriggerExecutionContext {
  /**
   * @param {DataProvider} dataProvider
   * @param {string} userId
   * @param {Contract} contract
   */
  constructor(dataProvider, userId, contract) {
    /**
     * @type {DataProvider}
     */
    this.dataProvider = dataProvider;
    this.userId = userId;
    this.contract = contract;
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
  getUserId() {
    return this.userId;
  }

  /**
   * @returns {Contract}
   */
  getContract() {
    return this.contract;
  }
}

module.exports = DataTriggerExecutionContext;
