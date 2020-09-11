const lodashGet = require('lodash.get');
const lodashSet = require('lodash.set');

/**
 *
 * @param {DataContract} dataContract
 * @param {string} type
 * @param {Object} originalObject
 * @param {function} transpileFunc
 * @return {Object}
 */
function transpileEncodedProperties(dataContract, type, originalObject, transpileFunc) {
  const encodedProperties = dataContract.getEncodedProperties(type);

  Object.keys(encodedProperties)
    .forEach((propertyPath) => {
      const property = encodedProperties[propertyPath];

      if (property.contentEncoding) {
        const value = lodashGet(originalObject, propertyPath);
        if (value !== undefined) {
          lodashSet(
            originalObject,
            propertyPath,
            transpileFunc(value, property.contentEncoding),
          );
        }
      }
    });

  return originalObject;
}

module.exports = transpileEncodedProperties;
