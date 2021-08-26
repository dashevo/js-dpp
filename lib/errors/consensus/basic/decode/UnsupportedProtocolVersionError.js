const ConsensusError = require('../../ConsensusError');

class UnsupportedProtocolVersionError extends ConsensusError {
  /**
   * @param {number} parsedProtocolVersion
   * @param {number} currentProtocolVersion
   */
  constructor(parsedProtocolVersion, currentProtocolVersion) {
    super(
      `Protocol version ${parsedProtocolVersion} is not supported. Current version is ${currentProtocolVersion}`,
    );

    this.parsedProtocolVersion = parsedProtocolVersion;
    this.currentProtocolVersion = currentProtocolVersion;
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
  getCurrentProtocolVersion() {
    return this.currentProtocolVersion;
  }
}

module.exports = UnsupportedProtocolVersionError;
