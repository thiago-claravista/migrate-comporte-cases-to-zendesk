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
const findTicket = require("./zendesk/findTicket");

const init = async () => {
  // obtem os casos
  const casePage = getCasePage();
  console.log(`Obtendo os casos da página ${casePage}...`);
  const cases = await getCases(casePage, 100);

  // obtem o numero dos casos
  const caseNumbers = cases?.map((c) => c.CASENUMBER);
  const caseNumbersInserted = getCaseNumbersInserted();
  const arrayIndex = getArrayIndex();

  // itera sobre os casos
  for (let i = 0; i < caseNumbers?.length || 0; i++) {
    const caseNumber = caseNumbers[i];

    if (caseNumbersInserted?.includes(caseNumber)) {
      continue;
    }

    // checa se o ticket ja existe na zendesk
    console.log(`Verificando existência do caso ${caseNumber} na Zendesk...`);
    const [foundTicket, ...rest] = await findTicket(caseNumber);
    if (foundTicket) {
      console.log(`Caso ${caseNumber} já presente na Zendesk`);

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
        insertLog({ ...error, case: caseNumber, page: casePage }, true);
      } else {
        console.log(error);
        insertLog({ error, case: caseNumber, page: casePage }, true);
      }
    }
  }

  // atualiza no log com a proxima pagina de busca de casos
  updateCasePage(casePage + 1);
};

init();
