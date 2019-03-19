const bs58 = require('bs58');

const ValidationResult = require('../../validation/ValidationResult');
const DuplicateDocumentError = require('../../errors/DuplicateDocumentError');

/**
 * @param {fetchDPObjectsByObjects} fetchDPObjectsByObjects
 * @param {DataProvider} dataProvider
 * @return {verifyDPObjectsUniquenessByIndices}
 */
function verifyDPObjectsUniquenessByIndicesFactory(fetchDPObjectsByObjects, dataProvider) {
  /**
   * @typedef verifyDPObjectsUniquenessByIndices
   * @param {STPacket} stPacket
   * @param {string} userId
   * @param {DPContract} dpContract
   * @return {ValidationResult}
   */
  async function verifyDPObjectsUniquenessByIndices(stPacket, userId, dpContract) {
    const result = new ValidationResult();

    // 1. Prepare fetchDPObjects queries from indexed properties
    const dpObjectIndexQueries = stPacket.getDocuments()
      .reduce((queries, document) => {
        const dpObjectSchema = dpContract.getDPObjectSchema(document.getType());

        if (!dpObjectSchema.indices) {
          return queries;
        }

        dpObjectSchema.indices
          .filter(index => index.unique)
          .forEach((indexDefinition) => {
            const where = indexDefinition.properties
              .reduce((obj, property) => {
                const propertyName = Object.keys(property)[0];
                // eslint-disable-next-line no-param-reassign
                obj[`document.${propertyName}`] = document.get(propertyName);

                return obj;
              }, {});

            // Exclude origin Document
            const idBuffer = Buffer.from(document.getId(), 'hex');
            // eslint-disable-next-line no-underscore-dangle
            where._id = { $ne: bs58.encode(idBuffer) };

            queries.push({
              type: document.getType(),
              indexDefinition,
              originDocument: document,
              where,
            });
          });

        return queries;
      }, []);

    // 2. Fetch Document by indexed properties
    const fetchDPObjectPromises = dpObjectIndexQueries
      .map(({
        type,
        where,
        indexDefinition,
        originDocument,
      }) => (
        dataProvider.fetchDPObjects(
          stPacket.getDPContractId(),
          type,
          { where },
        )
          .then(documents => Object.assign(documents, {
            indexDefinition,
            originDocument,
          }))
      ));

    const fetchedDPObjectsByIndices = await Promise.all(fetchDPObjectPromises);

    // 3. Create errors if duplicates found
    fetchedDPObjectsByIndices
      .filter(documents => documents.length !== 0)
      .forEach((documents) => {
        result.addError(
          new DuplicateDocumentError(
            documents.originDocument,
            documents.indexDefinition,
          ),
        );
      });

    return result;
  }

  return verifyDPObjectsUniquenessByIndices;
}

module.exports = verifyDPObjectsUniquenessByIndicesFactory;
