const ConsensusError = require('./ConsensusError');

class IdentityBalanceIsNotEnoughError extends ConsensusError {
  /**
   *
   * @param {number} balance
   */
  constructor(balance) {
    super('Identity balance is not enough');

    this.balance = balance;
  }

  /**
   * Get Identity balance
   * @return {number}
   */
  getBalance() {
    return this.balance;
  }
}

module.exports = IdentityBalanceIsNotEnoughError;
