const constants = {
  MAX_RESERVED_IDENTITY_TYPE: 32767,
  IDENTITY_TYPES: {
    DEFAULT: 0,
  },
};

/**
 * @type {number[]}
 */
constants.IDENTITY_TYPES_ENUM = Object
  .keys(constants.IDENTITY_TYPES)
  .map(typeName => constants.IDENTITY_TYPES[typeName]);

module.exports = constants;
