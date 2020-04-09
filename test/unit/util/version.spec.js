const rewiremock = require('rewiremock/node');

describe('version', () => {
  let versionsToCheck;

  before(() => {
    versionsToCheck = [
      ['0.12.0', '0.12.0'],
      ['1.0.12', '1.0.12'],
      ['12.012.6-dev', '12.012.6'],
      ['1.345.6.dev', '1.345.6'],
      ['10.15.3.build-123', '10.15.3'],
      ['0.0.0.1', '0.0.0'],
    ];
  });

  it('should return canonical version', async () => {
    versionsToCheck.forEach(([version, canonicalVersion]) => {
      const { getCanonicalVersion } = rewiremock.proxy('../../../lib/util/version', {
        '../../../package.json': { version },
      });

      expect(getCanonicalVersion()).to.equal(canonicalVersion);
    });
  });
});
