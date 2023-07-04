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
    "00049891",
    "00049912",
    "00052838",
    "00054031",
    "00054197",
    "00007620",
    "00008377",
    "00009601",
    "00011254",
    "00011789",
    "00017953",
    "00018543",
    "00018846",
    "00021547",
    "00024272",
    "00024321",
    "00024692",
    "00012192",
    "00028127",
    "00013673",
    "00013682",
    "00014168",
    "00015712",
    "00016751",
    "00031331",
    "00032177",
    "00035470",
    "00037183",
    "00036553",
    "00036573",
    "00036809",
    "00040784",
    "00043534",
    "00070051",
    "00048244",
    "00048652",
    "00057124",
    "00079558",
    "00081259",
    "00081506",
    "00081516",
    "00080671",
    "00084117",
    "00084746",
    "00085744",
    "00086333",
    "00077935",
    "00078932",
    "00088024",
    "00088637",
    "00088823",
    "00087718",
    "00090553",
    "00091502",
    "00092002",
    "00093075",
    "00092286",
    "00093210",
    "00093280",
    "00093387",
    "00097043",
    "00097058",
    "00110401",
    "00112445",
    "00113602",
    "00114992",
    "00114536",
    "00114530",
    "00115877",
    "00117780",
    "00120021",
    "00120396",
    "00121291",
    "00098044",
    "00121347",
    "00098069",
    "00121944",
    "00125341",
    "00100458",
    "00124190",
    "00101227",
    "00127702",
    "00127179",
    "00103531",
    "00128422",
    "00105409",
    "00129020",
    "00104715",
    "00106732",
    "00107438",
    "00107623",
    "00131019",
    "00134672",
    "00134887",
    "00134911",
    "00135204",
    "00135818",
    "00136260",
    "00138920",
    "00138422",
    "00139885",
    "00138768",
    "00140475",
    "00138853",
    "00151799",
    "00154889",
    "00156606",
    "00159599",
    "00160366",
    "00142737",
    "00144390",
    "00173297",
    "00267684",
    "00465818",
    "00535463",
    "00525542",
    "00791548",
    "00785347",
    "00865348",
    "00865976",
    "00873117",
    "01308699",
    "01532423",
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
