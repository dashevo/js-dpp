const Metadata = require('../../lib/Metadata');

describe('Metadata', () => {
  describe('#constructor', () => {
    it('should set height and core chain-locked height', () => {
      const result = new Metadata(42, 1);

      expect(result.blockHeight).to.equal(42);
      expect(result.coreChainLockedHeight).to.equal(1);
    });
  });

  describe('#setBlockHeight', () => {
    it('should set block height', () => {
      const result = new Metadata();
      result.setBlockHeight(42);

      expect(result.blockHeight).to.equal(42);
    });
  });

  describe('#getBlockHeight', () => {
    it('should get block height', () => {
      const result = new Metadata(42, 0);

      expect(result.getBlockHeight()).to.equal(42);
    });
  });

  describe('#setCoreChainLockedHeight', () => {
    it('should set core chain-locked height', () => {
      const result = new Metadata();
      result.setCoreChainLockedHeight(42);

      expect(result.coreChainLockedHeight).to.equal(42);
    });
  });

  describe('#getCoreChainLockedHeight', () => {
    it('should get core chain-locked height', () => {
      const result = new Metadata(0, 42);

      expect(result.getCoreChainLockedHeight()).to.equal(42);
    });
  });
});
