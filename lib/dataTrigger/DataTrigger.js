class DataTrigger {
  constructor(document) {

  }
}

module.exports = DataTrigger;


class DataTriggerContext {
  /**
   * @param {DataProvider} dataProvider
   */
  constructor(dataProvider) {
    /**
     * @type {DataProvider}
     */
    this.dataProvider = dataProvider;
  }
}

/**
 * typedef {function} DataTrigger
 * @param {Document} document
 * @param {DataTriggerContext} context
 */

/**
 * @type DataTrigger
 */
function dataTrigger(document, context) {
  /**
   * @type DataProvider
   */
  const { dataProvider } = context;
  if (document.type === 'dpns') {
    const perpublish = context.dataProvider.fetchDocuments();
  }
}
