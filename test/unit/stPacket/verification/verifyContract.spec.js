const verifyContract = require('../../../../lib/stPacket/verification/verifyContract');

const STPacket = require('../../../../lib/stPacket/STPacket');

const getContractFixture = require('../../../../lib/test/fixtures/getContractFixture');

const ContractAlreadyPresentError = require('../../../../lib/errors/ContractAlreadyPresentError');

const { expectValidationError } = require('../../../../lib/test/expect/expectError');

describe('verifyContract', () => {
  let dpContract;
  let stPacket;

  beforeEach(() => {
    dpContract = getContractFixture();

    stPacket = new STPacket(dpContract.getId());
    stPacket.setDPContract(dpContract);
  });

  it('should return invalid result if Contract is already present', async () => {
    const result = await verifyContract(stPacket, dpContract);

    expectValidationError(result, ContractAlreadyPresentError);

    const [error] = result.getErrors();

    expect(error.getDPContract()).to.equal(dpContract);
  });

  it('should return valid result if Contract is not present', async () => {
    const result = await verifyContract(stPacket, undefined);

    expectValidationError(result, ContractAlreadyPresentError, 0);
  });
});
