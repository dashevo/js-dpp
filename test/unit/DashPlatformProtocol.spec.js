const Ajv = require('ajv');

const DashPlatformProtocol = require('../../lib/DashPlatformProtocol');
const JsonSchemaValidator = require('../../lib/validation/JsonSchemaValidator');

const createStateRepositoryMock = require('../../lib/test/mocks/createStateRepositoryMock');

describe('DashPlatformProtocol', () => {
  let dpp;
  let stateRepositoryMock;
  let jsonSchemaValidatorMock;
  let useLockTxFallback;

  beforeEach(function beforeEach() {
    stateRepositoryMock = createStateRepositoryMock(this.sinonSandbox);
    jsonSchemaValidatorMock = {};
    useLockTxFallback = true;

    dpp = new DashPlatformProtocol({
      stateRepository: stateRepositoryMock,
      jsonSchemaValidator: jsonSchemaValidatorMock,
      useLockTxFallback,
    });
  });

  describe('constructor', () => {
    it('should create JsonSchemaValidator if not passed in options', () => {
      dpp = new DashPlatformProtocol();

      const jsonSchemaValidator = dpp.getJsonSchemaValidator();

      expect(jsonSchemaValidator).to.be.instanceOf(JsonSchemaValidator);
      expect(jsonSchemaValidator.ajv).to.be.instanceOf(Ajv);
    });
  });

  describe('getStateRepository', () => {
    it('should return StateRepository', () => {
      const result = dpp.getStateRepository();

      expect(result).to.equal(stateRepositoryMock);
    });
  });

  describe('getJsonSchemaValidator', () => {
    it('should return JsonSchemaValidator', () => {
      const result = dpp.getJsonSchemaValidator();

      expect(result).to.equal(jsonSchemaValidatorMock);
    });
  });

  describe('useLockTxFallback', () => {
    it('should contain useLockTxFallback value', async () => {
      expect(dpp.useLockTxFallback).to.equal(useLockTxFallback);
    });
  });
});
