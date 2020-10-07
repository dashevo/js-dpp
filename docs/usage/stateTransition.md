## dpp.stateTransition.createFromJSON(rawStateTransition, options)

**Description**: Create State Transition from JSON.

**Parameters**:

| parameters                   | type            | required | Description                                             |  
|------------------------------|-----------------|----------| --------------------------------------------------------|
| **rawStateTransition**       | RawDataContractCreateTransition/RawDocumentsBatchTransition     | yes      |                                                         |
| **options**                  | Object          | no       |                                                         |
| **options.skipValidation**   | boolean[=false] | no       |                                                         |

Returns : {RawDataContractCreateTransition|DocumentsBatchTransition}

# dpp.stateTransition.createFromObject(rawStateTransition, options)

**Description**: Create State Transition from a plain object.

**Parameters**:

| parameters                   | type            | required | Description                                             |  
|------------------------------|-----------------|----------| --------------------------------------------------------|
| **rawStateTransition**       | RawDataContractCreateTransition/RawDocumentsBatchTransition     | yes      |                                                         |
| **options**                  | Object          | no       |                                                         |
| **options.skipValidation**   | boolean[=false] | no       |                                                         |

Returns : {RawDataContractCreateTransition|DocumentsBatchTransition}

## dpp.stateTransition.createFromSerialized(payload, options)

**Description**: Create State Transition from string/buffer.

**Parameters**:

| parameters                   | type            | required | Description                                             |  
|------------------------------|-----------------|----------| --------------------------------------------------------|
| **payload**                  | Buffer/string   | yes      |                                                         |
| **options**                  | Object          | no       |                                                         |
| **options.skipValidation**   | boolean[=false] | no       |                                                         |

Returns : {RawDataContractCreateTransition|DocumentsBatchTransition}

## dpp.stateTransition.validate(stateTransition)

**Description**: Validate State Transition

**Parameters**:

| parameters                   | type            | required | Description                                             |  
|------------------------------|-----------------|----------| --------------------------------------------------------|
| **stateTransition**          | DataContractCreateTransition/RawDataContractCreateTransition/DocumentsBatchTransition/RawDocumentsBatchTransition   | yes      |                                                         |

Returns : {ValidationResult}

## dpp.stateTransition.validateStructure(stateTransition)

**Description**: Validate State Transition Structure

**Parameters**:

| parameters                   | type            | required | Description                                             |  
|------------------------------|-----------------|----------| --------------------------------------------------------|
| **stateTransition**          | DataContractCreateTransition/RawDataContractCreateTransition/DocumentsBatchTransition/RawDocumentsBatchTransition   | yes      |                                                         |

Returns : {ValidationResult}

## dpp.stateTransition.validateDate(stateTransition)

**Description**: Validate State Transition Structure

**Parameters**:

| parameters                   | type            | required | Description                                             |  
|------------------------------|-----------------|----------| --------------------------------------------------------|
| **stateTransition**          | DataContractCreateTransition/DocumentsBatchTransition/IdentityCreateTransition/RawDataContractCreateTransition/RawDocumentsBatchTransition/RawIdentityCreateTransition/RawIdentityTopUpTransition   | yes      |                                                         |

Returns : {ValidationResult}

## dpp.stateTransition.validateFee(stateTransition)

**Description**: Validate State Transition Structure

**Parameters**:

| parameters                   | type            | required | Description                                             |  
|------------------------------|-----------------|----------| --------------------------------------------------------|
| **stateTransition**          | StateTransition | yes      |                                                         |

Returns : {ValidationResult}

## dpp.stateTransition.apply(stateTransition)

**Description**: Apply state transition to the state

**Parameters**:

| parameters                   | type                    | required | Description                                             |  
|------------------------------|-------------------------|----------| --------------------------------------------------------|
| **stateTransition**          | AbstractStateTransition | yes      |                                                         |

Returns : {Promise<void>}
