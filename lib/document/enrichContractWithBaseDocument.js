const documentBaseSchema = require('../../schema/base/document');

/**
 * @typedef {enrichContractWithBaseDocument}
 * @param {Contract} contract
 * @param {string[]} excludeBaseProperty
 * @return {RawContract}
 */
function enrichContractWithBaseDocument(contract, excludeBaseProperty = []) {
  const rawContract = contract.toJSON();

  const jsonContract = JSON.stringify(rawContract);
  const clonedContract = JSON.parse(jsonContract);

  delete clonedContract.$schema;

  const { documents: clonedDocuments } = clonedContract;

  Object.keys(clonedDocuments).forEach((type) => {
    const clonedDocument = clonedDocuments[type];

    const { properties: baseDocumentProperties, required: baseRequired } = documentBaseSchema;

    if (!clonedDocument.required) {
      clonedDocument.required = [];
    }

    Object.keys(baseDocumentProperties)
      .filter(name => excludeBaseProperty.indexOf(name) === -1)
      .forEach((name) => {
        clonedDocument.properties[name] = baseDocumentProperties[name];
      });

    baseRequired.forEach(name => clonedDocument.required.push(name));
  });

  return clonedContract;
}

module.exports = enrichContractWithBaseDocument;
