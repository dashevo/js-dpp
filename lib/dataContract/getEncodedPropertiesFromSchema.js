/**
 * Recursively build properties map
 *
 * @param {Object} schema
 * @param {string} [propertyName=undefined]
 *
 * @return {Object}
 */
function buildEncodedPropertiesMap(schema, propertyName = undefined) {
  const propertyNames = Object.keys(schema.properties);

  return propertyNames.reduce((map, name) => {
    const property = schema.properties[name];

    const propertyPath = propertyName ? `${propertyName}.${name}` : name;

    if (property.type === 'object') {
      // eslint-disable-next-line no-param-reassign
      map = {
        ...map,
        ...buildEncodedPropertiesMap(property, propertyPath),
      };
    }

    if (property.type === 'array' && property.items.type === 'object') {
      // eslint-disable-next-line no-param-reassign
      map = {
        ...map,
        ...buildEncodedPropertiesMap(property.items, propertyPath),
      };
    }

    if (property.contentEncoding === 'binary') {
      // eslint-disable-next-line no-param-reassign
      map[propertyPath] = property;
    }

    return map;
  }, {});
}

/**
 * Construct and get all properties with `contentEncoding` constraint
 *
 * @param {Object} documentSchema
 *
 * @return {Object}
 */
function getEncodedPropertiesFromSchema(documentSchema) {
  if (!documentSchema.properties) {
    return {};
  }

  return buildEncodedPropertiesMap(documentSchema);
}

module.exports = getEncodedPropertiesFromSchema;
