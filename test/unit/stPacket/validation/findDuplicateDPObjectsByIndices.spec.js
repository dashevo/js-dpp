const findDuplicateDocumentsByIndices = require('../../../../lib/stPacket/validation/findDuplicateDocumentsByIndices');

const getDPContractFixture = require('../../../../lib/test/fixtures/getDPContractFixture');
const getDocumentsFixture = require('../../../../lib/test/fixtures/getDocumentsFixture');

describe('findDuplicateDPObjectsByIndices', () => {
  let rawDocuments;
  let dpContract;

  beforeEach(() => {
    rawDocuments = getDocumentsFixture().map(o => o.toJSON());

    dpContract = getDPContractFixture();
    dpContract.setDocumentSchema('nonUniqueIndexObject', {
      indices: [
        {
          properties: {
            $userId: 'asc',
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

    dpContract.setDocumentSchema('singleObject', {
      indices: [
        {
          properties: {
            $userId: 'asc',
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

    const [, , , william] = rawDocuments;

    rawDocuments.push(Object.assign({}, william, {
      $type: 'nonUniqueIndexObject',
    }));

    rawDocuments.push(Object.assign({}, william, {
      $type: 'singleObject',
    }));
  });

  it('should return duplicate objects if they are present', () => {
    const [, , , william, leon] = rawDocuments;
    leon.lastName = 'Birkin';

    const duplicates = findDuplicateDocumentsByIndices(rawDocuments, dpContract);
    expect(duplicates).to.deep.equal(
      [
        leon,
        william,
      ],
    );
  });

  it('should return an empty array of there are no duplicates', () => {
    const duplicates = findDuplicateDocumentsByIndices(rawDocuments, dpContract);
    expect(duplicates.length).to.equal(0);
  });
});
