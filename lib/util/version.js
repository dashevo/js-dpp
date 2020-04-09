const { version } = require('../../package.json');

module.exports = {
  /**
   * Format version string to canonical type
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
