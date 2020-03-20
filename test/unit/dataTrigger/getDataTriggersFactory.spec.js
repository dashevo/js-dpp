const AbstractDocumentTransition = require('../../../lib/document/stateTransition/actionTransition/AbstractDocumentTransition');

const getDataTriggersFactory = require('../../../lib/dataTrigger/getDataTriggersFactory');

const getDpnsDocumentFixture = require('../../../lib/test/fixtures/getDpnsDocumentFixture');

const DataTrigger = require('../../../lib/dataTrigger/DataTrigger');

const createDomainDataTrigger = require('../../../lib/dataTrigger/dpnsTriggers/createDomainDataTrigger');
const updateDomainDataTrigger = require('../../../lib/dataTrigger/dpnsTriggers/updateDomainDataTrigger');
const deleteDomainDataTrigger = require('../../../lib/dataTrigger/dpnsTriggers/deleteDomainDataTrigger');

const generateRandomId = require('../../../lib/test/utils/generateRandomId');

describe('getDataTriggers', () => {
  let getDataTriggers;

  let createDocument;
  let updateDocument;
  let deleteDocument;

  let createTrigger;
  let updateTrigger;
  let deleteTrigger;

  let dataContractId;
  let topLevelIdentity;

  beforeEach(function beforeEach() {
    createDocument = getDpnsDocumentFixture.getChildDocumentFixture();
    createDocument.setAction(AbstractDocumentTransition.ACTIONS.CREATE);

    updateDocument = getDpnsDocumentFixture.getChildDocumentFixture();
    updateDocument.setAction(AbstractDocumentTransition.ACTIONS.REPLACE);

    deleteDocument = getDpnsDocumentFixture.getChildDocumentFixture();
    deleteDocument.data = {};
    deleteDocument.setAction(AbstractDocumentTransition.ACTIONS.DELETE);

    dataContractId = getDpnsDocumentFixture.dataContract.getId();
    topLevelIdentity = generateRandomId();

    createTrigger = new DataTrigger(
      dataContractId, 'domain', AbstractDocumentTransition.ACTIONS.CREATE, createDomainDataTrigger, topLevelIdentity,
    );
    updateTrigger = new DataTrigger(
      dataContractId, 'domain', AbstractDocumentTransition.ACTIONS.REPLACE, updateDomainDataTrigger, topLevelIdentity,
    );
    deleteTrigger = new DataTrigger(
      dataContractId, 'domain', AbstractDocumentTransition.ACTIONS.DELETE, deleteDomainDataTrigger, topLevelIdentity,
    );

    this.sinonSandbox.stub(process, 'env').value({
      DPNS_CONTRACT_ID: dataContractId,
      DPNS_TOP_LEVEL_IDENTITY: topLevelIdentity,
    });

    getDataTriggers = getDataTriggersFactory();
  });

  it('should return matching triggers', () => {
    let result = getDataTriggers(
      dataContractId, createDocument.getType(), createDocument.getAction(),
    );

    expect(result).to.deep.equal([createTrigger]);

    result = getDataTriggers(
      dataContractId, updateDocument.getType(), updateDocument.getAction(),
    );

    expect(result).to.deep.equal([updateTrigger]);

    result = getDataTriggers(
      dataContractId, deleteDocument.getType(), deleteDocument.getAction(),
    );

    expect(result).to.deep.equal([deleteTrigger]);
  });

  it('should return empty trigger array for any other type except `domain`', () => {
    const result = getDataTriggers(
      dataContractId, 'otherType', AbstractDocumentTransition.ACTIONS.CREATE,
    );

    expect(result).to.deep.equal([]);
  });
});
