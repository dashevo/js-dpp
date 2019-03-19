const documentBaseSchema = require('../../schema/base/document');

/**
 * @typedef {enrichDPContractWithBaseDocument}
 * @param {DPContract} dpContract
 * @return {Object}
 */
function enrichDPContractWithBaseDocument(dpContract) {
  const rawDPContract = dpContract.toJSON();

  const jsonDPContract = JSON.stringify(rawDPContract);
  const clonedDPContract = JSON.parse(jsonDPContract);

  delete clonedDPContract.$schema;

  const { dpObjectsDefinition: clonedDPObjectsDefinition } = clonedDPContract;

  Object.keys(clonedDPObjectsDefinition).forEach((type) => {
    const clonedDPObjectDefinition = clonedDPObjectsDefinition[type];

    const { properties: baseDocumentProperties } = documentBaseSchema;

    if (!clonedDPObjectDefinition.required) {
      clonedDPObjectDefinition.required = [];
    }

    Object.keys(baseDocumentProperties).forEach((name) => {
      clonedDPObjectDefinition.properties[name] = baseDocumentProperties[name];
      clonedDPObjectDefinition.required.push(name);
    });
  });

  return clonedDPContract;
}

module.exports = enrichDPContractWithBaseDocument;
