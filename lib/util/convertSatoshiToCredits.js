const RATIO = 1000;

function convertSatoshiToCredits(amount) {
  return amount * RATIO;
}

module.exports = convertSatoshiToCredits;
