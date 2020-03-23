const Document = require('../../../../../lib/document/Document');

const findDuplicateDocumentsByIndices = require('../../../../../lib/document/stateTransition/validation/structure/findDuplicatesByIndices');

const getDataContractFixture = require('../../../../../lib/test/fixtures/getDataContractFixture');
const getDocumentsFixture = require('../../../../../lib/test/fixtures/getDocumentsFixture');
const getDocumentTransitionsFixture = require('../../../../../lib/test/fixtures/getDocumentTransitionsFixture');

describe('findDuplicatesByIndices', () => {
  let documents;
  let contract;
  let transitions;

  beforeEach(() => {
    contract = getDataContractFixture();
    contract.setDocumentSchema('nonUniqueIndexDocument', {
      indices: [
        {
          properties: {
            $ownerId: 'asc',
            lastName: 'asc',
          },
          unique: false,
        },
      ],
      properties: {
        firstName: {
          type: 'string',
        },
        lastName: {
          type: 'string',
        },
      },
      required: ['lastName'],
      additionalProperties: false,
    });

    contract.setDocumentSchema('singleDocument', {
      indices: [
        {
          properties: {
            $ownerId: 'asc',
            lastName: 'asc',
          },
          unique: true,
        },
      ],
      properties: {
        firstName: {
          type: 'string',
        },
        lastName: {
          type: 'string',
        },
      },
      required: ['lastName'],
      additionalProperties: false,
    });

    documents = getDocumentsFixture();

    const [, , , william] = documents;

    documents.push(new Document({
      ...william.toJSON(),
      $type: 'nonUniqueIndexDocument',
    }));

    documents.push(new Document({
      ...william.toJSON(),
      $type: 'singleDocument',
    }));

    transitions = getDocumentTransitionsFixture({
      create: documents,
    }).map((t) => t.toJSON());
  });

  it('should return duplicate documents if they are present', () => {
    const [, , , william, leon] = documents;

    leon.set('lastName', 'Birkin');

    transitions = getDocumentTransitionsFixture({
      create: documents,
    }).map((t) => t.toJSON());

    const duplicates = findDuplicateDocumentsByIndices(transitions, contract);
    expect(duplicates).to.have.deep.members(
      [
        transitions[3],
        transitions[4],
      ],
    );
  });

  it('should return an empty array of there are no duplicates', () => {
    const duplicates = findDuplicateDocumentsByIndices(transitions, contract);

    expect(duplicates.length).to.equal(0);
  });
});
