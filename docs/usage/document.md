## dpp.document.create(dataContract, ownerId, type, data = {})

**Description**: Instantiate a new Document.   
This method will generate the entropy and dataContractId for the user. 

**Parameters**:

| parameters                   | type            | required  | Description                                            |  
|------------------------------|-----------------|-----------| -------------------------------------------------------|
| **dataContract**             | DataContract    | yes       |                                                        |
| **ownerId**                  | string          | yes       |                                                        |
| **type**                     | string          | yes       |                                                        |
| **data**                     | Object[={}]     | no        |                                                        |

Returns : {[Document](/primitives/Document)}

## dpp.document.createFromObject(rawDocument, options)

**Description**: Instantiate a new Document from plain object representation.   
By default, the provided Document will be validated. 

**Parameters**:

| parameters                   | type            | required | Description                                             |  
|------------------------------|-----------------|----------| --------------------------------------------------------|
| **rawDocument**              | RawDocument     | yes      |                                                         |
| **options**                  | Object          | no       |                                                         |
| **options.skipValidation**   | boolean[=false] | no       |                                                         |
| **options.action**           | boolean         | no       |                                                         |

Returns : {[Document](/primitives/Document)}

## dpp.document.createFromJson(rawDocument, options)

**Description**: Instantiate a new Document from JSON.   
By default, the provided Document will be validated. 

**Parameters**:

| parameters                   | type            | required | Description                                             |  
|------------------------------|-----------------|----------| --------------------------------------------------------|
| **rawDocument**              | RawDocument     | yes      |                                                         |
| **options**                  | Object          | no       |                                                         |
| **options.skipValidation**   | boolean[=false] | no       |                                                         |
| **options.action**           | boolean         | no       |                                                         |

Returns : {[Document](/primitives/Document)}

## dpp.document.createFromSerialized(payload, options)

**Description**: Instantiate a new Data Contract from string/buffer.

**Parameters**:

| parameters                   | type            | required | Description                                             |  
|------------------------------|-----------------|----------| --------------------------------------------------------|
| **payload**                  | Buffer/string   | yes      |                                                         |
| **options**                  | Object          | no       |                                                         |
| **options.skipValidation**   | boolean[=false] | no       |                                                         |
| **options.action**           | boolean         | no       |                                                         |

Returns : {Promise<[Document](/primitives/Document)>}

## dpp.document.createStateTransition(documents)

**Description**: Create Documents State Transition

**Parameters**:

| parameters                   | type            | required | Description                                             |  
|------------------------------|-----------------|----------| --------------------------------------------------------|
| **documents**                | Object          | yes      |                                                         |
| **documents.create**         | Document[]      | no       |                                                         |
| **documents.replace**        | Document[]      | no       |                                                         |
| **documents.delete**         | Document[]      | no       |                                                         |

Returns : {DocumentsBatchTransition}
