const getCase = require("./comporte/getCase");
const insertLog = require("./utils/insertLog");
const putTicketIdInDatabaseRecord = require("./utils/putTicketIdInDatabaseRecord");
const sendCaseToZendesk = require("./utils/sendCaseToZendesk");
const findTicket = require("./zendesk/findTicket");

const init = async () => {
  // obter o numero dos casos
  const caseNumbers = require("./files/caseNumbers.json");

  // iterar sobre os casos
  // for (let i = 0; i < 1; i++) {
  for (let i = 0; i < caseNumbers.length; i++) {
    const caseNumber = caseNumbers[i];
    console.log(
      `Obtendo o caso ${caseNumber} (${i + 1}/${caseNumbers.length})...`
    );
    const foundCase = await getCase(caseNumber);

    if (!foundCase) {
      insertLog({
        error: `Caso ${caseNumber} não encontrado!`,
        case: caseNumber,
      });
    }

    // checar se o ticket ja existe na zendesk
    console.log("Verificando existência na Zendesk...");
    const exists = await findTicket(foundCase.CASENUMBER);
    if (exists) {
      console.log(`Caso ${foundCase.CASENUMBER} já presente na Zendesk`);
      continue;
    }

    try {
      console.log(`Enviando o caso ${foundCase.CASENUMBER} para a Zendesk...`);
      const ticketId = await sendCaseToZendesk(foundCase);

      // atualizar registro no banco de dados com o id do ticket
      await putTicketIdInDatabaseRecord(foundCase.ID, ticketId);

      // registra o log da inserção
      insertLog({ caseNumber: foundCase.CASENUMBER, ticket_id: ticketId });
    } catch (error) {
      if (Object.keys(error).length) {
        insertLog(error, true);
      } else {
        console.log(error);
      }
    }
  }
};

init();
