const ProtocolVersionParsingError = require('./basic/decode/ProtocolVersionParsingError');
const UnsupportedProtocolVersionError = require('./basic/decode/UnsupportedProtocolVersionError');
const IncompatibleProtocolVersionError = require('./basic/decode/IncompatibleProtocolVersionError');
const SerializedObjectParsingError = require('./basic/decode/SerializedObjectParsingError');
const JsonSchemaError = require('./basic/JsonSchemaError');
const InvalidIdentifierError = require('./basic/InvalidIdentifierError');
const DataContractMaxDepthExceedError = require('./basic/dataContract/DataContractMaxDepthExceedError');
const DuplicateIndexError = require('./basic/dataContract/DuplicateIndexError');
const InvalidCompoundIndexError = require('./basic/dataContract/InvalidCompoundIndexError');
const InvalidDataContractIdError = require('./basic/dataContract/InvalidDataContractIdError');
const InvalidIndexedPropertyConstraintError = require('./basic/dataContract/InvalidIndexedPropertyConstraintError');
const InvalidIndexPropertyTypeError = require('./basic/dataContract/InvalidIndexPropertyTypeError');
const SystemPropertyIndexAlreadyPresentError = require('./basic/dataContract/SystemPropertyIndexAlreadyPresentError');
const UndefinedIndexPropertyError = require('./basic/dataContract/UndefinedIndexPropertyError');
const UniqueIndicesLimitReachedError = require('./basic/dataContract/UniqueIndicesLimitReachedError');
const InconsistentCompoundIndexDataError = require('./basic/document/InconsistentCompoundIndexDataError');
const InvalidDocumentTransitionActionError = require('./basic/document/InvalidDocumentTransitionActionError');
const InvalidDocumentTransitionIdError = require('./basic/document/InvalidDocumentTransitionIdError');
const DataContractNotPresentError = require('./basic/document/DataContractNotPresentError');
const InvalidDocumentTypeError = require('./basic/document/InvalidDocumentTypeError');
const MissingDataContractIdError = require('./basic/document/MissingDataContractIdError');
const MissingDocumentTransitionActionError = require('./basic/document/MissingDocumentTransitionActionError');
const MissingDocumentTransitionTypeError = require('./basic/document/MissingDocumentTransitionTypeError');
const MissingDocumentTypeError = require('./basic/document/MissingDocumentTypeError');
const DuplicatedIdentityPublicKeyError = require('./basic/identity/DuplicatedIdentityPublicKeyError');
const DuplicatedIdentityPublicKeyIdError = require('./basic/identity/DuplicatedIdentityPublicKeyIdError');
const IdentityAssetLockProofLockedTransactionMismatchError = require('./basic/identity/IdentityAssetLockProofLockedTransactionMismatchError');
const IdentityAssetLockTransactionIsNotFoundError = require('./basic/identity/IdentityAssetLockTransactionIsNotFoundError');
const IdentityAssetLockTransactionOutPointAlreadyExistsError = require('./basic/identity/IdentityAssetLockTransactionOutPointAlreadyExistsError');
const IdentityAssetLockTransactionOutputNotFoundError = require('./basic/identity/IdentityAssetLockTransactionOutputNotFoundError');
const InvalidAssetLockProofCoreChainHeightError = require('./basic/identity/InvalidAssetLockProofCoreChainHeightError');
const InvalidAssetLockProofTransactionHeightError = require('./basic/identity/InvalidAssetLockProofTransactionHeightError');
const InvalidIdentityAssetLockTransactionError = require('./basic/identity/InvalidIdentityAssetLockTransactionError');
const InvalidIdentityAssetLockTransactionOutputError = require('./basic/identity/InvalidIdentityAssetLockTransactionOutputError');
const InvalidIdentityPublicKeyDataError = require('./basic/identity/InvalidIdentityPublicKeyDataError');
const InvalidStateTransitionTypeError = require('./basic/stateTransition/InvalidStateTransitionTypeError');
const MissingStateTransitionTypeError = require('./basic/stateTransition/MissingStateTransitionTypeError');
const StateTransitionMaxSizeExceededError = require('./basic/stateTransition/StateTransitionMaxSizeExceededError');

const IdentityNotFoundError = require('./signature/IdentityNotFoundError');
const InvalidIdentityPublicKeyTypeError = require('./signature/InvalidIdentityPublicKeyTypeError');
const InvalidStateTransitionSignatureError = require('./signature/InvalidStateTransitionSignatureError');
const MissingPublicKeyError = require('./signature/MissingPublicKeyError');

const BalanceIsNotEnoughError = require('./fee/BalanceIsNotEnoughError');

const DataContractAlreadyPresentError = require('./state/dataContract/DataContractAlreadyPresentError');
const DataTriggerConditionError = require('./state/dataContract/dataTrigger/DataTriggerConditionError');
const DataTriggerExecutionError = require('./state/dataContract/dataTrigger/DataTriggerExecutionError');
const DataTriggerInvalidResultError = require('./state/dataContract/dataTrigger/DataTriggerInvalidResultError');
const DocumentAlreadyPresentError = require('./state/document/DocumentAlreadyPresentError');
const DocumentNotFoundError = require('./state/document/DocumentNotFoundError');
const DocumentOwnerIdMismatchError = require('./state/document/DocumentOwnerIdMismatchError');
const DocumentTimestampsMismatchError = require('./state/document/DocumentTimestampsMismatchError');
const DocumentTimestampWindowViolationError = require('./state/document/DocumentTimestampWindowViolationError');
const DuplicateUniqueIndexError = require('./state/document/DuplicateUniqueIndexError');
const InvalidDocumentRevisionError = require('./state/document/InvalidDocumentRevisionError');
const IdentityAlreadyExistsError = require('./state/identity/IdentityAlreadyExistsError');
const IdentityPublicKeyAlreadyExistsError = require('./state/identity/IdentityPublicKeyAlreadyExistsError');
const InvalidJsonSchemaRefError = require('./basic/dataContract/InvalidJsonSchemaRefError');
const JsonSchemaCompilationError = require('./basic/JsonSchemaCompilationError');
const DuplicateDocumentTransitionsWithIdsError = require('./basic/document/DuplicateDocumentTransitionsWithIdsError');
const DuplicateDocumentTransitionsWithIndicesError = require('./basic/document/DuplicateDocumentTransitionsWithIndicesError');
const InvalidAssetLockTransactionOutputReturnSize = require('./basic/identity/InvalidAssetLockTransactionOutputReturnSize');
const InvalidInstantAssetLockProofError = require('./basic/identity/InvalidInstantAssetLockProofError');
const InvalidInstantAssetLockProofSignatureError = require('./basic/identity/InvalidInstantAssetLockProofSignatureError');

const codes = {
  /**
   * Basic
   */

  // Decoding
  1000: ProtocolVersionParsingError,
  1001: UnsupportedProtocolVersionError,
  1002: IncompatibleProtocolVersionError,
  1003: SerializedObjectParsingError,

  // General
  1004: JsonSchemaCompilationError,
  1005: JsonSchemaError,
  1006: InvalidIdentifierError,

  // Data Contract
  1007: DataContractMaxDepthExceedError,
  1008: DuplicateIndexError,
  1009: InvalidCompoundIndexError,
  1010: InvalidDataContractIdError,
  1011: InvalidIndexedPropertyConstraintError,
  1012: InvalidIndexPropertyTypeError,
  1013: InvalidJsonSchemaRefError,
  1014: SystemPropertyIndexAlreadyPresentError,
  1015: UndefinedIndexPropertyError,
  1016: UniqueIndicesLimitReachedError,

  // Document
  1017: DataContractNotPresentError,
  1018: DuplicateDocumentTransitionsWithIdsError,
  1019: DuplicateDocumentTransitionsWithIndicesError,
  1020: InconsistentCompoundIndexDataError,
  1021: InvalidDocumentTransitionActionError,
  1022: InvalidDocumentTransitionIdError,
  1023: InvalidDocumentTypeError,
  1024: MissingDataContractIdError,
  1025: MissingDocumentTransitionActionError,
  1026: MissingDocumentTransitionTypeError,
  1027: MissingDocumentTypeError,

  // Identity
  1028: DuplicatedIdentityPublicKeyError,
  1029: DuplicatedIdentityPublicKeyIdError,
  1030: IdentityAssetLockProofLockedTransactionMismatchError,
  1031: IdentityAssetLockTransactionIsNotFoundError,
  1032: IdentityAssetLockTransactionOutPointAlreadyExistsError,
  1033: IdentityAssetLockTransactionOutputNotFoundError,
  1034: InvalidAssetLockProofCoreChainHeightError,
  1035: InvalidAssetLockProofTransactionHeightError,
  1036: InvalidAssetLockTransactionOutputReturnSize,
  1037: InvalidIdentityAssetLockTransactionError,
  1038: InvalidIdentityAssetLockTransactionOutputError,
  1039: InvalidIdentityPublicKeyDataError,
  1040: InvalidInstantAssetLockProofError,
  1041: InvalidInstantAssetLockProofSignatureError,

  // State Transition
  1042: InvalidStateTransitionTypeError,
  1043: MissingStateTransitionTypeError,
  1044: StateTransitionMaxSizeExceededError,

  /**
   * Signature
   */

  2000: IdentityNotFoundError,
  2001: InvalidIdentityPublicKeyTypeError,
  2002: InvalidStateTransitionSignatureError,
  2003: MissingPublicKeyError,

  /**
   * Fee
   */

  3000: BalanceIsNotEnoughError,

  /**
   * State
   */

  // Data Contract
  4000: DataContractAlreadyPresentError,
  4001: DataTriggerConditionError,
  4002: DataTriggerExecutionError,
  4003: DataTriggerInvalidResultError,

  // Document
  4004: DocumentAlreadyPresentError,
  4005: DocumentNotFoundError,
  4006: DocumentOwnerIdMismatchError,
  4007: DocumentTimestampsMismatchError,
  4008: DocumentTimestampWindowViolationError,
  4009: DuplicateUniqueIndexError,
  4010: InvalidDocumentRevisionError,

  // Identity
  4011: IdentityAlreadyExistsError,
  4012: IdentityPublicKeyAlreadyExistsError,
};

module.exports = codes;
