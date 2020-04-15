const semver = require('semver');
const { version } = require('../../package.json');

module.exports = {
  /**
   * Get current version in canonical format
   *
   * @return {string}
   */
  getProtocolVersion() {
    return semver.valid(semver.coerce(version));
  },
};
