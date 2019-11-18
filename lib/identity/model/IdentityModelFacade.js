const MissingOptionError = require('../../errors/MissingOptionError');

class IdentityModelFacade {
  constructor(validator) {
    this.validator = validator;
  }

  create() {}
  createFromObject() {}
  createFromSerialized() {}
  validate() {}
}

module.exports = IdentityModelFacade;
