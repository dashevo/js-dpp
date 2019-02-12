/**
 * @param {Sandbox} sinonSandbox
 *
 * @returns {{
 *     packet: {
 *         createFromSerialized:
 *             function(payload: Buffer|string, options: Object): Promise<STPacket>
 *     }
 * }}
 */
module.exports = function createDPPMock(sinonSandbox) {
  const packet = {
    createFromSerialized: sinonSandbox.stub(),
  };

  return {
    packet,
  };
};
