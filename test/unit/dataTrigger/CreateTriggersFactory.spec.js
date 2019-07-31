const CreateTriggersFactory = require('../../../lib/dataTrigger/CreateTriggersFactory');
const DataTrigger = require('../../../lib/dataTrigger/DataTrigger');
const getDpnsContractFixture = require('../../../lib/test/fixtures/getDpnsContractFixture');

describe('CreateTriggersFactory', () => {
  let contract;

  beforeEach(() => {
    contract = getDpnsContractFixture();
  });

  it('should create data triggers and check they are right instances', () => {
    const triggers = new CreateTriggersFactory(contract);

    expect(triggers).to.be.an('array');
    expect(triggers.length).to.be.equal(3);
    triggers.forEach((trigger) => {
      expect(trigger).to.be.an.instanceOf(DataTrigger);
    });
  });
});
