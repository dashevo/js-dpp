class PublicKey {
  /**
   * @param {RawPublicKey} [rawPublicKey]
   */
  constructor(rawPublicKey = undefined) {
    if (rawPublicKey) {
      this.setId(rawPublicKey.id)
        .setType(rawPublicKey.type)
        .setData(rawPublicKey.data)
        .setEnabled(rawPublicKey.isEnabled);
    }
  }

  /**
   * Get key ID
   *
   * @return {number}
   */
  getId() {
    return this.id;
  }

  /**
   * Set key ID
   *
   * @param {number} id
   * @return {PublicKey}
   */
  setId(id) {
    this.id = id;

    return this;
  }

  /**
   * Get key type
   *
   * @return {number}
   */
  getType() {
    return this.type;
  }

  /**
   * Set key type
   *
   * @param {number} type
   * @return {PublicKey}
   */
  setType(type) {
    this.type = type;

    return this;
  }

  /**
   * Set base64 encoded public key
   *
   * @param {string} data
   * @return {PublicKey}
   */
  setData(data) {
    this.data = data;

    return this;
  }

  /**
   * Get base64 encoded public key
   *
   * @return {string}
   */
  getData() {
    return this.data;
  }

  /**
   * Disable/enable public key
   *
   * @param {boolean} enabled
   * @return {PublicKey}
   */
  setEnabled(enabled) {
    this.enabled = enabled;

    return this;
  }

  /**
   * Is Public key enabled?
   *
   * @return {boolean}
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Get JSON representation
   *
   * @return {RawPublicKey}
   */
  toJSON() {
    return {
      id: this.getId(),
      type: this.getType(),
      data: this.getData(),
      isEnabled: this.isEnabled(),
    };
  }
}

PublicKey.TYPES = {
  ECDSA_SECP256K1: 1,
};

module.exports = PublicKey;
