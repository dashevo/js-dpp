const lodashGet = require('lodash.get');
const lodashSet = require('lodash.set');
const lodashCloneDeep = require('lodash.clonedeep');

/**
 *
 * @param {DataContract} dataContract
 * @param {string} type
 * @param {Object} originalObject
 * @param {function} transpileFunc
 * @return {Object}
 */
function transpileEncodedProperties(dataContract, type, originalObject, transpileFunc) {
  const clonedObject = lodashCloneDeep(originalObject);

  const encodedProperties = dataContract.getEncodedProperties(type);

  Object.keys(encodedProperties)
    .forEach((propertyPath) => {
      const property = encodedProperties[propertyPath];

      if (property.contentEncoding) {
        const value = lodashGet(clonedObject, propertyPath);
        if (value !== undefined) {
          lodashSet(
            clonedObject,
            propertyPath,
            transpileFunc(value, property.contentEncoding, propertyPath),
          );
        }
      }
    });

  return clonedObject;
}

module.exports = transpileEncodedProperties;
