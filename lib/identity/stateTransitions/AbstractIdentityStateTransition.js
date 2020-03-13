const AbstractStateTransition = require('../../stateTransition/AbstractStateTransition');

/**
 * @abstract
 */
class AbstractIdentityStateTransition extends AbstractStateTransition {
  constructor() {
    super();

    this.signature = null;
  }

  /**
   * @abstract
   * @param {Object} [options]
   * @return {{protocolVersion: number, type: number, [signature]: string}}
   */
  toJSON(options = {}) {
    const skipSignature = !!options.skipSignature;

    let json = super.toJSON(options);

    if (!skipSignature) {
      json = {
        ...json,
        signature: this.getSignature(),
      };
    }

    return json;
  }

  /**
   *  Returns signature
   *
   * @return {string|null}
   */
  getSignature() {
    return this.signature;
  }
}

module.exports = AbstractIdentityStateTransition;
