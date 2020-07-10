const DataContract = require('./DataContract');

/**
 * @typedef {enrichDataContractWithBaseSchema}
 *
 * @param {DataContract|RawDataContract} dataContract
 * @param {Object} baseSchema
 * @param {string[]} [excludeDataContractProperties]
 * @param {string[]} [excludeBaseDocumentProperties]
 *
 * @return {RawDataContract}
 */
function enrichDataContractWithBaseSchema(
  dataContract,
  baseSchema,
  excludeDataContractProperties = [],
  excludeBaseDocumentProperties = [],
) {
  const rawDataContract = (dataContract instanceof DataContract)
    ? dataContract.toJSON()
    : dataContract;

  const jsonDataContract = JSON.stringify(rawDataContract);
  const clonedDataContract = JSON.parse(jsonDataContract);

  delete clonedDataContract.$schema;

  const { documents: clonedDocuments } = clonedDataContract;

  Object.keys(clonedDocuments).forEach((type) => {
    const clonedDocument = clonedDocuments[type];

    const {
      properties: baseProperties,
      required: baseRequired,
    } = baseSchema;

    if (!clonedDocument.required) {
      clonedDocument.required = [];
    }

    Object.keys(baseProperties)
      .filter((name) => excludeBaseDocumentProperties.indexOf(name) === -1)
      .forEach((name) => {
        clonedDocument.properties[name] = baseProperties[name];
      });

    baseRequired.forEach((name) => clonedDocument.required.push(name));

    excludeDataContractProperties.forEach((property) => {
      delete clonedDocument[property];
    });

    clonedDocument.required = clonedDocument.required
      .filter((property) => excludeDataContractProperties.indexOf(property) === -1);
  });

  return clonedDataContract;
}

module.exports = enrichDataContractWithBaseSchema;
