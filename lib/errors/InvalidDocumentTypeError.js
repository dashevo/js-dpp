const ConsensusError = require('./ConsensusError');

class InvalidDocumentTypeError extends ConsensusError {
  /**
   * @param {string} type
   * @param {Contract} dpContract
   */
  constructor(type, dpContract) {
    super(`Contract ${dpContract.name} doesn't contain type ${type}`);

    this.name = this.constructor.name;

    this.type = type;
    this.dpContract = dpContract;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Get type
   *
   * @return {string}
   */
  getType() {
    return this.type;
  }

  /**
   * Get Contract
   *
   * @return {Contract}
   */
  getContract() {
    return this.dpContract;
  }
}

module.exports = InvalidDocumentTypeError;
