const getEncodedPropertiesFromSchema = require(
  '../../../lib/dataContract/getEncodedPropertiesFromSchema',
);

describe('getEncodedPropertiesFromSchema', () => {
  let documentSchema;

  beforeEach(() => {
    documentSchema = {
      properties: {
        simple: {
          type: 'string',
        },
        withEncoding: {
          type: 'string',
          contentEncoding: 'binary',
        },
        nestedObject: {
          type: 'object',
          properties: {
            simple: {
              type: 'string',
            },
            withEncoding: {
              type: 'string',
              contentEncoding: 'binary',
            },
          },
        },
        arrayOfObject: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              simple: {
                type: 'string',
              },
              withEncoding: {
                type: 'string',
                contentEncoding: 'binary',
              },
            },
          },
        },
        arrayOfObjects: {
          type: 'array',
          items: [
            {
              type: 'object',
              properties: {
                simple: {
                  type: 'string',
                },
                withEncoding: {
                  type: 'string',
                  contentEncoding: 'binary',
                },
              },
            },
            {
              type: 'string',
            },
            {
              type: 'array',
              items: [
                {
                  type: 'object',
                  properties: {
                    simple: {
                      type: 'string',
                    },
                    withEncoding: {
                      type: 'string',
                      contentEncoding: 'binary',
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    };
  });

  it('should return an empty object if not `properties` property found', () => {
    const result = getEncodedPropertiesFromSchema({});

    expect(result).to.deep.equal({});
  });

  it('should return flat object with properties having contentEncoding keyword', () => {
    const result = getEncodedPropertiesFromSchema(documentSchema);

    expect(result).to.deep.equal({
      withEncoding: { type: 'string', contentEncoding: 'binary' },
      'nestedObject.withEncoding': { type: 'string', contentEncoding: 'binary' },
      'arrayOfObject.withEncoding': { type: 'string', contentEncoding: 'binary' },
      'arrayOfObjects[0].withEncoding': { type: 'string', contentEncoding: 'binary' },
      'arrayOfObjects[2][0].withEncoding': { type: 'string', contentEncoding: 'binary' },
    });
  });
});
