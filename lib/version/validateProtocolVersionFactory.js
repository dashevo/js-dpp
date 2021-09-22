const UnsupportedProtocolVersionError = require('../errors/consensus/basic/UnsupportedProtocolVersionError');
const CompatibleProtocolVersionIsNotDefinedError = require('../errors/CompatibleProtocolVersionIsNotDefinedError');
const ValidationResult = require('../validation/ValidationResult');

/**
 * @param {DashPlatformProtocol} dpp
 * @param versionCompatibilityMap
 * @returns {validateProtocolVersion}
 */
function validateProtocolVersionFactory(dpp, versionCompatibilityMap) {
  /**
   * @typedef {validateProtocolVersion}
   * @param {number} protocolVersion
   * @returns {ValidationResult}
   */
  function validateProtocolVersion(protocolVersion) {
    const result = new ValidationResult();

    const maxReceivedVersion = Math.max(protocolVersion, dpp.getProtocolVersion());
    const minReceivedVersion = Math.min(protocolVersion, dpp.getProtocolVersion());
    const compatibilityVersion = versionCompatibilityMap[maxReceivedVersion];

    if (!Object.prototype.hasOwnProperty.call(versionCompatibilityMap, maxReceivedVersion)) {
      throw new CompatibleProtocolVersionIsNotDefinedError(maxReceivedVersion);
    }

    // Parsed protocol version must be equal or lower than current version
    if (minReceivedVersion < compatibilityVersion) {
      result.addError(
        new UnsupportedProtocolVersionError(
          protocolVersion,
          dpp.getProtocolVersion(),
        ),
      );

      return result;
    }

    return result;
  }

  return validateProtocolVersion;
}

module.exports = validateProtocolVersionFactory;
