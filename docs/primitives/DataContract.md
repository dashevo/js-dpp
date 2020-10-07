**Usage**: `new DataContract(rawDataContract)`  
**Description**: Instantiate a DataContract.

**Parameters**:

| parameters                                | type            | required           | Description               |  
|-------------------------------------------|-----------------|--------------------| --------------------------|
| **rawDataContract**                       | RawDataContract | yes                |                           |
| **rawDataContract.$id**                   | string          | yes                |                           |
| **rawDataContract.$schema**               | string          | yes                |                           |
| **rawDataContract.protocolVersion**       | number          | yes                |                           |
| **rawDataContract.ownerId**               | string          | yes                |                           |
| **rawDataContract.documents**             | Object<str, obj>| yes                |                           |
| **rawDataContract.definitions**           | Object<str, obj>| no                 |                           |

**Returns**: A new valid instance of DataContract

## .getProtocolVersion()

**Description**: Get Data Contract protocol version

**Parameters**: None.  

**Returns**: {number}

## .getId()

**Description**: Get Data Contract id

**Parameters**: None.  

**Returns**: {string}

## .getOwnerId()

**Description**: Get Data Contract owner id

**Parameters**: None.  

**Returns**: {string}

## .getJsonSchemaId()

**Description**: Get Data Contract JSON Schema ID

**Parameters**: None.  

**Returns**: {string}

## .setJsonMetaSchema(schema)

**Description**: Allow to set JSON Meta Schema to this DataContract (overwrite previous value).

**Parameters**:  

| parameters            | type            | required           | Description                                                                                                                                                                    |  
|-----------------------|-----------------|--------------------| -------------------------------- |
| **schema**            | string          | yes                |                                  |

**Returns**: {DataContract}

## .getJsonMetaSchema()

**Description**: Get Data Contract JSON Meta Schema

**Parameters**: None.  

**Returns**: {string}

## .setDocuments(documents)

**Description**: Allow to set documents for this DataContract (overwrite previous value).

**Parameters**:  

| parameters         | type                   | required           | Description                                                                                                                                                                    |  
|--------------------|------------------------|--------------------| -------------------------------- |
| **documents**      | Object<string, Object> | yes                |                                  |

**Returns**: {DataContract}

## .getDocuments()

**Description**: Get Data Contract JSON Meta Schema

**Parameters**: None.  

**Returns**: {Object<string, Object>} - documents

## .isDocumentDefined(type)

**Description**: Returns true if document type has been defined

**Parameters**:  

| parameters         | type    | required           | Description                                                                                                                                                                    |  
|--------------------|---------|--------------------| -------------------------------- |
| **type**           | string  | yes                |                                  |

**Returns**: {Boolean} - whether document type has been defined

## .setDocumentSchema(type, schema)

**Description**: Setter for document schema.

**Parameters**:  

| parameters         | type    | required           | Description                                                                                                                                                                    |  
|--------------------|---------|--------------------| -------------------------------- |
| **type**           | string  | yes                |                                  |
| **schema**         | object  | yes                |                                  |

**Returns**: {DataContract}

## .getDocumentSchema(type)

**Description**: Get Data Contract Document Schema for the provided type

**Parameters**:  

| parameters         | type    | required           | Description                                                                                                                                                                    |  
|--------------------|---------|--------------------| -------------------------------- |
| **type**           | string  | yes                |                                  |

**Returns**: {Object} - document

## .getDocumentSchemaRef(type)

**Description**: Get Data Contract Document schema reference

**Parameters**:  

| parameters         | type    | required           | Description                                                                                                                                                                    |  
|--------------------|---------|--------------------| -------------------------------- |
| **type**           | string  | yes                |                                  |

**Returns**: {{$ref: string}} - reference

## .setDefinitions(definitions)

**Description**: Setter for definitions.

**Parameters**:  

| parameters         | type                   | required           | Description                                                                                                                                                                    |  
|--------------------|------------------------|--------------------| -------------------------------- |
| **definitions**    | Object<string, Object> | yes                |                                  |

**Returns**: {DataContract}

## .getDefinitions()

**Description**: Get Data Contract definitions

**Parameters**: None.  

**Returns**: {Object<string, Object>} - definitions

## .getEncodedProperties(type)

**Description**: Get properties with `contentEncoding` constraint

**Parameters**:  

| parameters         | type    | required           | Description                                                                                                                                                                    |  
|--------------------|---------|--------------------| -------------------------------- |
| **type**           | string  | yes                |                                  |

**Returns**: {Object}

## .toJSON()

**Description**: Return Data Contract as plain object

**Parameters**: None.  

**Returns**: {RawDataContract}

## .serialize()

**Description**: Return serialized Data Contract

**Parameters**: None.  

**Returns**: {Buffer}

## .hash()

**Description**: Returns hex string with Data Contract hash

**Parameters**: None.  

**Returns**: {string}

## .setEntropy(entropy)

**Description**: Set Data Contract entropy

**Parameters**:  

| parameters         | type                   | required           | Description                                                                                                                                                                    |  
|--------------------|------------------------|--------------------| -------------------------------- |
| **entropy**        | string                 | yes                |                                  |

**Returns**: {DataContract}

## .getEntropy()

**Description**: Get Data Contract entropy

**Parameters**: None.  

**Returns**: {string}
