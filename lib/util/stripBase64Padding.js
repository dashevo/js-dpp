/**
 * Remove padding from base64 encoded string
 *
 * @param {string} originalString
 *
 * @returns {string}
 */
function stripBase64Padding(originalString) {
  return originalString.replace(/=/g, '');
}

module.exports = stripBase64Padding;
