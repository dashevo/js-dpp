const {
  convertSatoshiToCredits,
  convertCreditsToSatoshi,
  RATIO,
} = require('../../../lib/identity/creditsConverter');

describe('creditsConverter', () => {
  describe('convertSatoshiToCredits', () => {
    it('should convert satoshi to credits', () => {
      const amount = 42;

      const convertedAmount = convertSatoshiToCredits(amount);

      expect(convertedAmount).to.equal(amount * RATIO);
    });
  });
  describe('convertCreditsToSatoshi', () => {
    it('should convert credits to satoshi', () => {
      const amount = 4242;

      const convertedAmount = convertCreditsToSatoshi(amount);

      expect(convertedAmount).to.equal(Math.ceil(amount / RATIO));
    });
  });
});
