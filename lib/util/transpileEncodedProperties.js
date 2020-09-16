const lodashGet = require('lodash.get');
const lodashSet = require('lodash.set');
const lodashCloneDeepWith = require('lodash.clonedeepwith');
const EncodedBuffer = require('../dataContract/EncodedBuffer');

/**
 *
 * @param {DataContract} dataContract
 * @param {string} type
 * @param {Object} originalObject
 * @param {function} transpileFunction
 * @return {Object}
 */
function transpileEncodedProperties(dataContract, type, originalObject, transpileFunction) {
  const clonedObject = lodashCloneDeepWith(originalObject, (val) => {
    if (val instanceof EncodedBuffer) {
      return new EncodedBuffer(val.toBuffer(), val.getEncoding());
    }
  });

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
            transpileFunction(value, property.contentEncoding, propertyPath),
          );
        }
      }
    });

  return clonedObject;
}

module.exports = transpileEncodedProperties;
