const bs58 = require('bs58');

/**
 * @param {DataProvider} dataProvider
 * @return {fetchDPObjectsByObjects}
 */
function fetchDPObjectsByObjectsFactory(dataProvider) {
  /**
   * @typedef fetchDPObjectsByObjects
   * @param {string} dpContractId
   * @param {Document[]} documents
   * @return {Document[]}
   */
  async function fetchDPObjectsByObjects(dpContractId, documents) {
    // Group Document IDs by types
    const documentIdsByTypes = documents.reduce((obj, document) => {
      if (!obj[document.getType()]) {
        // eslint-disable-next-line no-param-reassign
        obj[document.getType()] = [];
      }

      const idBuffer = Buffer.from(document.getId(), 'hex');
      const id = bs58.encode(idBuffer);

      obj[document.getType()].push(id);

      return obj;
    }, {});

    // Convert object to array
    const documentArray = Object.entries(documentIdsByTypes);

    // Fetch Documents by IDs
    const fetchedDPObjectPromises = documentArray.map(([type, ids]) => {
      const options = {
        where: { _id: { $in: ids } },
      };

      return dataProvider.fetchDPObjects(
        dpContractId,
        type,
        options,
      );
    });

    const fetchedDPObjectsByTypes = await Promise.all(fetchedDPObjectPromises);

    return fetchedDPObjectsByTypes.reduce((array, objects) => array.concat(objects), []);
  }

  return fetchDPObjectsByObjects;
}

module.exports = fetchDPObjectsByObjectsFactory;
