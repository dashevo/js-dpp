const validateSTPacketContractsFactory = require('../../../../lib/stPacket/validation/validateSTPacketContractsFactory');

const ValidationResult = require('../../../../lib/validation/ValidationResult');

const { expectValidationError } = require('../../../../lib/test/expect/expectError');

const getContractFixture = require('../../../../lib/test/fixtures/getContractFixture');

const ConsensusError = require('../../../../lib/errors/ConsensusError');

describe('validateSTPacketContractsFactory', () => {
  let rawSTPacket;
  let rawDPContract;
  let dpContract;
  let validateSTPacketContracts;
  let validateContractMock;

  beforeEach(function beforeEach() {
    dpContract = getContractFixture();
    rawDPContract = dpContract.toJSON();
    rawSTPacket = {
      contractId: dpContract.getId(),
      itemsMerkleRoot: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
      itemsHash: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
      contracts: [rawDPContract],
      documents: [],
    };

    validateContractMock = this.sinonSandbox.stub().returns(new ValidationResult());

    validateSTPacketContracts = validateSTPacketContractsFactory(
      validateContractMock,
    );
  });

  it('should return invalid result if Contract is wrong', () => {
    const dpContractError = new ConsensusError('test');

    validateContractMock.returns(
      new ValidationResult([dpContractError]),
    );

    const result = validateSTPacketContracts(rawSTPacket);

    expectValidationError(result);

    const [error] = result.getErrors();

    expect(error).to.equal(dpContractError);
  });

  it('should return valid result if Contract is valid', () => {
    const result = validateSTPacketContracts(rawSTPacket);

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();
  });
});
