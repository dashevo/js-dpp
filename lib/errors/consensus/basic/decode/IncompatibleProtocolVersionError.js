const ConsensusError = require('../../ConsensusError');

class IncompatibleProtocolVersionError extends ConsensusError {
  /**
   * @param {number} parsedProtocolVersion
   * @param {number} minimalProtocolVersion
   */
  constructor(parsedProtocolVersion, minimalProtocolVersion) {
    super(
      `Protocol version ${parsedProtocolVersion} is not supported. Minimal supported protocol version is ${minimalProtocolVersion}`,
    );

    this.parsedProtocolVersion = parsedProtocolVersion;
    this.minimalProtocolVersion = minimalProtocolVersion;
  }

  /**
   * @return {number}
   */
  getParsedProtocolVersion() {
    return this.parsedProtocolVersion;
  }

  /**
   * @return {number}
   */
  getMinimalProtocolVersion() {
    return this.minimalProtocolVersion;
  }
}

module.exports = IncompatibleProtocolVersionError;
