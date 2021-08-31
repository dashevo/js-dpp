const DPPError = require('../DPPError');

const STRIP_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,)]*))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;

/**
 * @abstract
 */
class AbstractConsensusError extends DPPError {
  /**
   * @return {number}
   */
  getCode() {
    // Mitigate recursive dependency

    // eslint-disable-next-line global-require
    const codes = require('./codes');

    const code = Object.keys(codes)
      .find((c) => this.constructor === codes[c]);

    if (!code) {
      throw new Error('Error code is not defined');
    }

    return parseInt(code, 10);
  }

  /**
   * Get array of the error's arguments
   *
   * @returns {*[]}
   */
  getConstructorArguments() {
    return this.getConstructorParamNames()
      .map((param) => this[param]);
  }

  /**
   * Get key-value pairs of the error's arguments
   *
   * @returns {Object}
   */
  getConstructorParams() {
    return this.getConstructorParamNames()
      .reduce((params, param) => (
        { ...params, [param]: this[param] }
      ), {});
  }

  /**
   * @private
   * @returns {string[]}
   */
  getConstructorParamNames() {
    let { constructor } = this;
    let constructorMatch;

    do {
      constructorMatch = constructor.toString()
        .match(/constructor\s*\([^\\)]*\)\s*\\{[^\\}]*\\}/m);
      // eslint-disable-next-line no-cond-assign,no-proto
    } while (!constructorMatch && (constructor = constructor.__proto__));

    const functionString = constructorMatch[1].replace(STRIP_COMMENTS, '');

    return functionString.slice(
      functionString.indexOf('(') + 1,
      functionString.indexOf(')'),
    ).match(ARGUMENT_NAMES);
  }
}

module.exports = AbstractConsensusError;
