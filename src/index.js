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
    "00186454",
    "00179509",
    "00248236",
    "00259317",
    "00266300",
    "00330394",
    "00357985",
    "00358384",
    "00358540",
    "00370925",
    "00373232",
    "00408387",
    "00409027",
    "00415548",
    "00441176",
    "00450583",
    "00452718",
    "00484216",
    "00492626",
    "00507033",
    "00535312",
    "00529848",
    "00553294",
    "00586636",
    "00586679",
    "00589048",
    "00631512",
    "00602513",
    "00718292",
    "00703300",
    "00797753",
    "00846003",
    "00849904",
    "00873036",
    "00873633",
    "00890312",
    "00890843",
    "00888796",
    "00918705",
    "00932579",
    "00974125",
    "00998666",
    "01061948",
    "01070263",
    "01110549",
    "01110937",
    "01117610",
    "01123239",
    "01136313",
    "01138172",
    "01168839",
    "01170080",
    "01183090",
    "01190036",
    "01222198",
    "01246796",
    "01312524",
    "01312715",
    "01335380",
    "01321574",
    "01459659",
    "01468887",
  ];

  if (casePage) {
    console.log(`Obtendo os casos da página ${casePage}...`);
    const options = {
      subject: "Informação - Benefício - Programa Fidelidade",
    };
    const cases = await getCases(casePage, 100, options);

    if (!cases?.length) {
      console.log(`Nenhum caso encontrado na página ${casePage}.`);
      process.exit(0);
    }

    // obtem o numero dos casos
    const _caseNumbers = cases?.map((c) => c.CASENUMBER);
    if (_caseNumbers) {
      caseNumbers.push(_caseNumbers);
    }
  }

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
