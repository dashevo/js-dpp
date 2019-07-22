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
}

module.exports = DataTriggerExecutionContext;
