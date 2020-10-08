const lodashCloneDeepWith = require('lodash.clonedeepwith');
const Identifier = require('../Identifier');

/**
 * Clone data which contains EncodedBuffer
 *
 * @param {*} value
 * @return {*}
 */
function cloneDeepRawData(value) {
  // eslint-disable-next-line consistent-return
  return lodashCloneDeepWith(value, (item) => {
    if (item instanceof Identifier) {
      return new Identifier(item.toBuffer(), item.getEncoding());
    }
  });
}

module.exports = cloneDeepRawData;
