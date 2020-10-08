const lodashCloneDeep = require('lodash.clonedeep');

const DataContract = require('./DataContract');

/**
 * @typedef {enrichDataContractWithBaseSchema}
 *
 * @param {DataContract} dataContract
 * @param {Object} baseSchema
 * @param {number} schemaIdBytePrefix
 * @param {string[]} [excludeProperties]
 *
 * @return {DataContract}
 */
function enrichDataContractWithBaseSchema(
  dataContract,
  baseSchema,
  schemaIdBytePrefix,
  excludeProperties = [],
) {
  const clonedDataContract = lodashCloneDeep(dataContract.toObject());

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
      .forEach((name) => {
        clonedDocument.properties[name] = baseProperties[name];
      });

    baseRequired.forEach((name) => clonedDocument.required.push(name));

    excludeProperties.forEach((property) => {
      delete clonedDocument[property];
    });

    clonedDocument.required = clonedDocument.required
      .filter((property) => !excludeProperties.includes(property));
  });

  // Add schema $id prefix
  clonedDataContract.$id[0] = schemaIdBytePrefix;

  return new DataContract(clonedDataContract);
}

module.exports = enrichDataContractWithBaseSchema;
