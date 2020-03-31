const DashPlatformProtocol = require('../../../lib/DashPlatformProtocol');

const Identity = require('../../../lib/identity/Identity');

const ValidationResult = require('../../../lib/validation/ValidationResult');

const getIdentityFixture = require('../../../lib/test/fixtures/getIdentityFixture');

const createStateRepositoryMock = require('../../../lib/test/mocks/createStateRepositoryMock');

describe('IdentityFacade', () => {
  let dpp;
  let identity;
  let stateRepositoryMock;

  beforeEach(function beforeEach() {
    const rawTransaction = '030000000137feb5676d0851337ea3c9a992496aab7a0b3eee60aeeb9774000b7f4bababa5000000006b483045022100d91557de37645c641b948c6cd03b4ae3791a63a650db3e2fee1dcf5185d1b10402200e8bd410bf516ca61715867666d31e44495428ce5c1090bf2294a829ebcfa4ef0121025c3cc7fbfc52f710c941497fd01876c189171ea227458f501afcb38a297d65b4ffffffff021027000000000000166a14152073ca2300a86b510fa2f123d3ea7da3af68dcf77cb0090a0000001976a914152073ca2300a86b510fa2f123d3ea7da3af68dc88ac00000000';

    stateRepositoryMock = createStateRepositoryMock(this.sinonSandbox);
    stateRepositoryMock.fetchTransaction.resolves(rawTransaction);

    dpp = new DashPlatformProtocol({
      stateRepository: stateRepositoryMock,
    });

    identity = getIdentityFixture();
  });

  describe('#create', () => {
    it('should create Identity', () => {
      identity.balance = 0;

      const result = dpp.identity.create(
        identity.getId(),
        identity.getPublicKeys(),
      );

      expect(result).to.be.an.instanceOf(Identity);

      expect(result).to.deep.equal(identity);
    });
  });

  describe('#createFromObject', () => {
    it('should create Identity from plain object', () => {
      const result = dpp.identity.createFromObject(identity.toJSON());

      expect(result).to.be.an.instanceOf(Identity);

      expect(result).to.deep.equal(identity);
    });
  });

  describe('#createFromSerialized', () => {
    it('should create Identity from string', () => {
      const result = dpp.identity.createFromSerialized(identity.serialize());

      expect(result).to.be.an.instanceOf(Identity);

      expect(result).to.deep.equal(identity);
    });
  });

  describe('#validate', () => {
    it('should validate Identity', async () => {
      const result = await dpp.identity.validate(identity);

      expect(result).to.be.an.instanceOf(ValidationResult);
      expect(result.isValid()).to.be.true();
    });
  });
});
