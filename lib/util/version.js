const { version } = require('../../package.json');

module.exports = {
  /**
   * Get current version in canonical format
   *
   * @return {string}
   */
  getCanonicalVersion() {
    return version
      .split('.')
      .slice(0, 3)
      .map((num) => num.replace(/\D/g, ''))
      .join('.');
  },
};
