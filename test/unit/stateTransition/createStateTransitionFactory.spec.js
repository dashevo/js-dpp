const createStateTransitionFactory = require('../../../lib/stateTransition/createStateTransitionFactory');

const DataContractStateTransition = require('../../../lib/dataContract/stateTransition/DataContractStateTransition');
const DocumentsStateTransition = require('../../../lib/document/stateTransition/DocumentsStateTransition');

const getDataContractFixture = require('../../../lib/test/fixtures/getDataContractFixture');
const getDocumentsFixture = require('../../../lib/test/fixtures/getDocumentsFixture');

const InvalidStateTransitionTypeError = require('../../../lib/errors/InvalidStateTransitionTypeError');

describe('createStateTransitionFactory', () => {
  let createStateTransition;

  beforeEach(() => {
    createStateTransition = createStateTransitionFactory();
  });

  it('should return DataContractStateTransition if type is DATA_CONTRACT', () => {
    const dataContract = getDataContractFixture();

    const stateTransition = new DataContractStateTransition(dataContract);

    const result = createStateTransition(stateTransition.toJSON());

    expect(result).to.be.instanceOf(DataContractStateTransition);
    expect(result.getDataContract().toJSON()).to.deep.equal(dataContract.toJSON());
  });

  it('should return DocumentsStateTransition if type is DOCUMENTS', () => {
    const documents = getDocumentsFixture();
    const stateTransition = new DocumentsStateTransition(documents);

    const result = createStateTransition(stateTransition.toJSON());

    expect(result).to.be.instanceOf(DocumentsStateTransition);
    expect(result.getDocuments()).to.deep.equal(documents);
  });

  it('should throw InvalidStateTransitionTypeError if type is invalid', () => {
    const rawStateTransition = {
      type: 666,
    };

    try {
      createStateTransition(rawStateTransition);

      expect.fail('InvalidStateTransitionTypeError is not thrown');
    } catch (e) {
      expect(e).to.be.an.instanceOf(InvalidStateTransitionTypeError);
      expect(e.getRawStateTransition()).to.equal(rawStateTransition);
    }
  });
});
