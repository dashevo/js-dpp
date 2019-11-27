const ConsensusError = require('./ConsensusError');

class SignatureVerificationError extends ConsensusError {
  /**
   * @param {string} signature
   * @param {Error} verificationError
   */
  constructor(signature, verificationError) {
    super("Can't verify signature");

    this.signature = signature;
    this.error = verificationError;
  }

  /**
   * Get errored signature
   *
   * @return {string}
   */
  getSignature() {
    return this.signature;
  }

  getVerificationError() {
    return this.error;
  }
}

module.exports = SignatureVerificationError;
