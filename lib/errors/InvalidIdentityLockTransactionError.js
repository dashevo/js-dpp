const ConsensusError = require('./ConsensusError');

class InvalidIdentityLockTransactionError extends ConsensusError {
  /**
   * @param {string} message
   * @param {Transaction} transaction
   */
  constructor(message, transaction) {
    super(`Invalid identity lock transaction: ${message}`);

    this.transaction = transaction;
  }

  /**
   * Get lock transaction
   *
   * @return {Transaction}
   */
  getTransaction() {
    return this.transaction;
  }
}

module.exports = InvalidIdentityLockTransactionError;
