## dpp.dataContract.create(ownerId, documents)

**Description**: Instantiate a new Data Contract.   
This method will generate the entropy and dataContractId for the user. 

**Parameters**:

| parameters                   | type            | required  | Description                                            |  
|------------------------------|-----------------|-----------| -------------------------------------------------------|
| **ownerId**                  | String          | yes       |                                                        |
| **documents**                | Object          | yes       |                                                        |

Returns : {[DataContract](/primitives/DataContract)}

## dpp.dataContract.createFromObject(rawDataContract, options)

**Description**: Instantiate a new Data Contract from plain object representation.   
By default, the provided rawDataContract will be validated. 

**Parameters**:

| parameters                   | type            | required | Description                                             |  
|------------------------------|-----------------|----------| --------------------------------------------------------|
| **rawDataContract**          | RawDataContract | yes      |                                                         |
| **options**                  | Object          | no       |                                                         |
| **options.skipValidation**   | boolean[=false]  | no       |                                                         |

Returns : {Promise<[DataContract](/primitives/DataContract)>}

## dpp.dataContract.createFromSerialized(payload, options)

**Description**: Instantiate a new Data Contract from string/buffer.

**Parameters**:

| parameters                   | type            | required | Description                                             |  
|------------------------------|-----------------|----------| --------------------------------------------------------|
| **payload**                  | Buffer/string   | yes      |                                                         |
| **options**                  | Object          | no       |                                                         |
| **options.skipValidation**   | boolean[=false] | no       |                                                         |

Returns : {Promise<[DataContract](/primitives/DataContract)>}

## dpp.dataContract.createStateTransition(dataContract)

**Description**: Create a new Data Contract State Transition

**Parameters**:

| parameters                   | type            | required | Description                                             |  
|------------------------------|-----------------|----------| --------------------------------------------------------|
| **dataContract**             | DataContract    | yes      |                                                         |

Returns : {DataContractCreateTransition}

## dpp.dataContract.validate(dataContract)

**Description**: Validate Data Contract

**Parameters**:

| parameters                   | type                         | required | Description                                             |  
|------------------------------|------------------------------|----------| --------------------------------------------------------|
| **dataContract**             | DataContract/RawDataContract | yes      |                                                         |

Returns : {DataContractCreateTransition}
