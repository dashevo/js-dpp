const CONVERT_RATIO = 1000;

function convertSatoshiToCredits(amount) {
  return amount * CONVERT_RATIO;
}

function convertCreditsToSatoshi(amount) {
  return Math.ceil(amount / CONVERT_RATIO);
}

module.exports = {
  convertSatoshiToCredits,
  convertCreditsToSatoshi,
  CONVERT_RATIO,
};
