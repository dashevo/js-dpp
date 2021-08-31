const SomeConsensusError = require('../../../../lib/test/SomeConsensusError');

describe('AbstractConsensusError', () => {
  let message;
  let error;

  beforeEach(() => {
    message = 'test';
    error = new SomeConsensusError(message);
  });

  describe('#getConstructorArguments', () => {
    it('should return the error\'s arguments', () => {
      const result = error.getConstructorArguments();

      expect(result).to.deep.equal([message]);
    });
  });

  describe('#getConstructorParams', () => {
    it('should return the error\'s arguments', () => {
      const result = error.getConstructorParams();

      expect(result).to.deep.equal({
        message,
      });
    });
  });
});
