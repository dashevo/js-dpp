const ConsensusError = require('./ConsensusError');

class InvalidIdentityLockTransactionError extends ConsensusError {
  /**
   * @param {Transaction} transaction
   */
  constructor(transaction) {
    super('Invalid identity lock transaction');

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
