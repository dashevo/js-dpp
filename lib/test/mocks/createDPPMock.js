/**
 * @param {Sandbox} sinonSandbox
 *
 * @returns {{
 *     contract: {
 *         create:
 *             function(name: string, dpObjectsDefinition: Object): DPContract,
 *         createFromObject:
 *             function(rawDPContract: Object, options: Object): DPContract,
 *         createFromSerialized:
 *             function(payload: Buffer|string, options: Object): DPContract,
 *         validate:
 *             function(dpContract: DPContract|Object): ValidationResult
 *     },
 *     object: {
 *         create:
 *             function(type: string, [data]: Object): DPObject,
 *         createFromObject:
 *             function(rawDPObject: Object, options: Object): DPObject,
 *         createFromSerialized:
 *             function(payload: Buffer|string, options: Object): DPObject,
 *         validate:
 *             function(dpObject: DPObject|Object): ValidationResult
 *     },
 *     packet: {
 *         create:
 *             function(items: DPContract|Array): STPacket,
 *         createFromObject:
 *             function(rawDPSTPacket: Object, options: Object): Promise<STPacket>,
 *         createFromSerialized:
 *             function(payload: Buffer|string, options: Object): Promise<STPacket>,
 *         validate:
 *             function(stPacket: STPacket|Object): ValidationResult,
 *         verify:
 *             function(stPacket: STPacket, stateTransition: Transaction): Promise<ValidationResult>
 *     },
 *     packetHeader: {
 *         create:
 *             function(dpContractId: string,
 *                      itemsMerkleRoot: string,
 *                      itemsHash: string): STPacketHeader,
 *         createFromObject:
 *             function(rawSTPacketHeader: Object): STPacketHeader,
 *         createFromSerialized:
 *             function(payload: Buffer|string): STPacketHeader,
 *         validate:
 *             function(stPacketHeader: STPacketHeader|Object): ValidationResult
 *     },
 *     getUserId:
 *         function(): string,
 *     getDPContract:
 *         function(): DPContract,
 *     getDataProvider:
 *         function(): DataProvider
 * }}
 */
module.exports = function createDPPMock(sinonSandbox) {
  const contract = {
    create: sinonSandbox.stub(),
    createFromObject: sinonSandbox.stub(),
    createFromSerialized: sinonSandbox.stub(),
    validate: sinonSandbox.stub(),
  };

  const object = {
    create: sinonSandbox.stub(),
    createFromObject: sinonSandbox.stub(),
    createFromSerialized: sinonSandbox.stub(),
    validate: sinonSandbox.stub(),
  };

  const packet = {
    create: sinonSandbox.stub(),
    createFromObject: sinonSandbox.stub(),
    createFromSerialized: sinonSandbox.stub(),
    validate: sinonSandbox.stub(),
    verify: sinonSandbox.stub(),
  };

  const packetHeader = {
    create: sinonSandbox.stub(),
    createFromObject: sinonSandbox.stub(),
    createFromSerialized: sinonSandbox.stub(),
    validate: sinonSandbox.stub(),
  };

  return {
    contract,
    object,
    packet,
    packetHeader,
    getUserId: sinonSandbox.stub(),
    getDPContract: sinonSandbox.stub(),
    getDataProvider: sinonSandbox.stub(),
  };
};
