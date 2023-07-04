const getCase = require("./comporte/getCase");
const getCases = require("./comporte/getCases");
const getArrayIndex = require("./utils/getArrayIndex");
const getCaseNumbersInserted = require("./utils/getCaseNumbersInserted");
const getCasePage = require("./utils/getCasePage");
const insertLog = require("./utils/insertLog");
const putTicketIdInDatabaseRecord = require("./utils/putTicketIdInDatabaseRecord");
const sendCaseToZendesk = require("./utils/sendCaseToZendesk");
const updateArrayIndex = require("./utils/updateArrayIndex");
const updateCasePage = require("./utils/updateCasePage");
const deleteTicket = require("./zendesk/deleteTicket");
const findTicket = require("./zendesk/findTicket");

const init = async () => {
  // obtem os casos
  // const casePage = getCasePage();
  const casePage = null;
  const caseNumbers = [
    "00232071",
    "00241895",
    "00242394",
    "00243790",
    "00258589",
    "00286922",
    "00287715",
    "00287712",
    "00291641",
    "00301445",
    "00322973",
    "00332925",
    "00343077",
    "00360208",
    "00344549",
    "00351637",
    "00351501",
    "00383017",
    "00417070",
    "00441553",
    "00429892",
    "00458731",
    "00461248",
    "00496783",
    "00499086",
    "00535463",
    "00525542",
    "00548454",
    "00526391",
    "00526410",
    "00567495",
    "00567822",
    "00580792",
    "00581640",
    "00626460",
    "00629320",
    "00603786",
    "00608786",
    "00680507",
    "00686796",
    "00691715",
    "00716366",
    "00729860",
    "00771022",
    "00833622",
    "00933744",
    "00914206",
    "00945857",
    "00964779",
    "01001969",
    "01006026",
    "01015090",
    "01022510",
    "01033655",
    "01062702",
    "01095793",
    "01115746",
    "01118075",
    "01129925",
    "01192987",
    "01222507",
    "01232672",
    "01235242",
    "01240609",
    "01242391",
    "01251362",
    "01257108",
    "01268606",
    "01303609",
    "01302882",
    "01302926",
    "01294531",
    "01295100",
    "01329951",
    "01334716",
    "01322252",
    "01322364",
    "01324310",
    "01354264",
    "01356998",
    "01374627",
    "01379262",
    "01409211",
    "01391274",
    "01392503",
    "01429067",
    "01429727",
    "01457982",
    "01461418",
    "01472885",
    "01488937",
    "01490553",
    "01504515",
    "01504553",
    "01512700",
    "01520743",
    "01528635",
    "01528620",
    "01528634",
    "01550132",
    "01550906",
    "01551424",
    "01575034",
    "01597457",
    "01595079",
    "01612330",
    "01621062",
    "01642515",
    "01646063",
  ];

  if (casePage) {
    console.log(`Obtendo os casos da página ${casePage}...`);
    const options = {
      subject: "Informação - Benefício - Deficiente Físico",
    };
    const cases = await getCases(casePage, 100, options);

    if (!cases?.length) {
      console.log(`Nenhum caso encontrado na página ${casePage}.`);
      process.exit(0);
    }

    // obtem o numero dos casos
    const _caseNumbers = cases?.map((c) => c.CASENUMBER);
    if (_caseNumbers?.length) {
      caseNumbers.push(..._caseNumbers);
    }
  }

  const caseNumbersInserted = getCaseNumbersInserted();
  const arrayIndex = getArrayIndex();

  // itera sobre os casos
  for (let i = 0; i < caseNumbers?.length || 0; i++) {
    const caseNumber = caseNumbers[i];

    if (caseNumbersInserted?.includes(caseNumber)) {
      console.log(`Caso ${caseNumber} já inserido!`);
      continue;
    }

    // checa se o ticket ja existe na zendesk
    console.log(`Verificando existência do caso ${caseNumber} na Zendesk...`);
    const [foundTicket, ...rest] = await findTicket(caseNumber);
    if (foundTicket) {
      console.log(
        `Caso ${caseNumber} já presente na Zendesk (ticket ${foundTicket.id}).`
      );

      if (rest.length) {
        insertLog(
          {
            error: `Caso ${caseNumber} duplicado na Zendesk!`,
            case: caseNumber,
          },
          true
        );
      }

      continue;
    }

    console.log(
      `Obtendo o caso ${caseNumber} (${i + 1}/${caseNumbers.length})...`
    );
    const foundCase = await getCase(caseNumber);

    if (!foundCase) {
      console.log(`Caso ${caseNumber} não encontrado!`);
      insertLog(
        {
          error: `Caso ${caseNumber} não encontrado!`,
          case: caseNumber,
        },
        true
      );
      continue;
    }
    try {
      console.log(`Enviando o caso ${foundCase.CASENUMBER} para a Zendesk...`);
      const ticketId = await sendCaseToZendesk(foundCase);

      // atualiza o registro no banco de dados com o id do ticket
      await putTicketIdInDatabaseRecord(foundCase.ID, ticketId);

      // registra o log da inserção
      insertLog({ case: foundCase.CASENUMBER, ticket_id: ticketId });

      // atualiza no log o index do array do proximo caso em arquivo
      // updateArrayIndex(i + 1);
    } catch (error) {
      if (Object.keys(error).length) {
        if (error.ticket_id) {
          // deletar o ticket na zendesk
          console.log(`Deletando o ticket ${error.ticket_id} na Zendesk...`);
          try {
            await deleteTicket(error.ticket_id);
          } catch (error) {
            insertLog({ ...error, case: caseNumber, page: casePage }, true);
          }
        } else {
          insertLog({ ...error, case: caseNumber, page: casePage }, true);
        }
      } else {
        console.log(error);
        insertLog({ error, case: caseNumber, page: casePage }, true);
      }
    }
  }

  // atualiza no log com a proxima pagina de busca de casos
  if (casePage) {
    updateCasePage(casePage + 1);
    init();
  }
};

init();
