const { decode } = require('../util/serializer');

const InvalidStateTransitionError = require('./errors/InvalidStateTransitionError');
const SerializedObjectParsingError = require('../errors/SerializedObjectParsingError');

class StateTransitionFactory {
  /**
   * @param {validateStateTransitionStructure} validateStateTransitionStructure
   * @param {createStateTransitionFromJSON} createStateTransitionFromJSON
   * @param {createStateTransitionFromObject} createStateTransitionFromObject
   */
  constructor(
    validateStateTransitionStructure,
    createStateTransitionFromJSON,
    createStateTransitionFromObject,
  ) {
    this.validateStateTransitionStructure = validateStateTransitionStructure;
    this.createStateTransitionFromJSON = createStateTransitionFromJSON;
    this.createStateTransitionFromObject = createStateTransitionFromObject;
  }

  /**
   * Create State Transition from JSON
   *
   * @param {RawDataContractCreateTransition|RawDocumentsBatchTransition} rawStateTransition
   * @param {Object} options
   * @param {boolean} [options.skipValidation=false]
   * @return {RawDataContractCreateTransition|DocumentsBatchTransition}
   */
  async createFromJSON(rawStateTransition, options = {}) {
    const opts = { skipValidation: false, ...options };

    if (!opts.skipValidation) {
      const result = await this.validateStateTransitionStructure(rawStateTransition);

      if (!result.isValid()) {
        throw new InvalidStateTransitionError(result.getErrors(), rawStateTransition);
      }
    }

    const stateTransition = await this.createStateTransitionFromJSON(rawStateTransition);

    return stateTransition;
  }

  /**
   * Create State Transition from plain object
   *
   * @param {RawDataContractCreateTransition|RawDocumentsBatchTransition} rawStateTransition
   * @param {Object} options
   * @param {boolean} [options.skipValidation=false]
   * @return {RawDataContractCreateTransition|DocumentsBatchTransition}
   */
  async createFromObject(rawStateTransition, options = {}) {
    const opts = { skipValidation: false, ...options };

    if (!opts.skipValidation) {
      const result = await this.validateStateTransitionStructure(rawStateTransition);

      if (!result.isValid()) {
        throw new InvalidStateTransitionError(result.getErrors(), rawStateTransition);
      }
    }

    const stateTransition = await this.createStateTransitionFromObject(rawStateTransition);

    return stateTransition;
  }

  /**
   * Create State Transition from string/buffer
   *
   * @param {Buffer|string} payload
   * @param {Object} options
   * @param {boolean} [options.skipValidation=false]
   * @return {RawDataContractCreateTransition|DocumentsBatchTransition}
   */
  async createFromSerialized(payload, options = { }) {
    let rawStateTransition;
    try {
      rawStateTransition = decode(payload);
    } catch (error) {
      throw new InvalidStateTransitionError([
        new SerializedObjectParsingError(
          payload,
          error,
        ),
      ]);
    }

    return this.createFromJSON(rawStateTransition, options);
  }
}

module.exports = StateTransitionFactory;
