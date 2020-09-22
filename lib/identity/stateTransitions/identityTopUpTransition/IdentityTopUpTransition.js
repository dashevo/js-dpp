const AbstractStateTransition = require('../../../stateTransition/AbstractStateTransition');
const stateTransitionTypes = require('../../../stateTransition/stateTransitionTypes');
const EncodedBuffer = require('../../../util/encoding/EncodedBuffer');

class IdentityTopUpTransition extends AbstractStateTransition {
  /**
   * @param {RawIdentityTopUpTransition} [rawIdentityTopUpTransition]
   */
  constructor(rawIdentityTopUpTransition) {
    super(rawIdentityTopUpTransition);

    if (rawIdentityTopUpTransition) {
      this
        .setLockedOutPoint(rawIdentityTopUpTransition.lockedOutPoint)
        .setIdentityId(rawIdentityTopUpTransition.identityId);
    }
  }

  /**
   * Get State Transition type
   *
   * @return {number}
   */
  getType() {
    return stateTransitionTypes.IDENTITY_TOP_UP;
  }

  /**
   * Sets an outPoint. OutPoint is a pointer to the output funding the top up.
   * More about the OutPoint can be found in the identity documentation
   * @param {string} lockedOutPoint
   * @return {IdentityTopUpTransition}
   */
  setLockedOutPoint(lockedOutPoint) {
    this.lockedOutPoint = EncodedBuffer.from(lockedOutPoint, EncodedBuffer.ENCODING.BASE64);

    return this;
  }

  /**
   * @return {EncodedBuffer}
   */
  getLockedOutPoint() {
    return this.lockedOutPoint;
  }

  /**
   * Returns base58 representation of the identity id top up
   *
   * @param {string|buffer} identityId
   * @return {IdentityTopUpTransition}
   */
  setIdentityId(identityId) {
    this.identityId = EncodedBuffer.from(identityId, EncodedBuffer.ENCODING.BASE58);

    return this;
  }

  /**
   * Returns base58 representation of the identity id top up
   *
   * @return {EncodedBuffer}
   */
  getIdentityId() {
    return this.identityId;
  }

  /**
   * Returns Owner ID
   *
   * @return {EncodedBuffer}
   */
  getOwnerId() {
    return this.identityId;
  }

  /**
   * Get state transition as plain object
   *
   * @param {Object} [options]
   * @param {boolean} [options.skipSignature]
   * @param {boolean} [options.encodedBuffer=false]
   * @return {Object}
   */
  toObject(options = {}) {
    Object.assign(
      options,
      {
        encodedBuffer: false,
        ...options,
      },
    );

    let plainObject = {
      ...super.toObject(options),
      identityId: this.getIdentityId(),
      lockedOutPoint: this.getLockedOutPoint(),
    };

    if (!options.encodedBuffer) {
      plainObject = {
        ...plainObject,
        identityId: plainObject.identityId.toBuffer(),
        lockedOutPoint: plainObject.lockedOutPoint.toBuffer(),
      };
    }

    return plainObject;
  }

  /**
   * Get state transition as JSON
   *
   * @param {Object} [options]
   *
   * @return {Object}
   */
  toJSON(options = {}) {
    const rawTransition = super.toJSON({
      ...options,
      encodedBuffer: true,
    });

    return {
      ...rawTransition,
      identityId: rawTransition.identityId.toString(),
      lockedOutPoint: rawTransition.lockedOutPoint.toString(),
    };
  }

  /**
   * Create state transition from JSON
   *
   * @param {RawIdentityTopUpTransition} rawStateTransition
   *
   * @return {IdentityTopUpTransition}
   */
  static fromJSON(rawStateTransition) {
    return new IdentityTopUpTransition(
      AbstractStateTransition.translateJsonToObject(rawStateTransition),
    );
  }
}

/**
 * @typedef {Object} RawIdentityTopUpTransition
 * @extends RawStateTransition
 * @property {string} lockedOutPoint
 * @property {string} identityId
 */

module.exports = IdentityTopUpTransition;
