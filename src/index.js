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
    "00006942",
    "00083773",
    "00153971",
    "00166680",
    "00166717",
    "00170196",
    "00174584",
    "00181258",
    "00211944",
    "00214655",
    "00222529",
    "00224399",
    "00224989",
    "00227372",
    "00232418",
    "00234828",
    "00237475",
    "00243331",
    "00257422",
    "00265535",
    "00284459",
    "00321981",
    "00302239",
    "00323446",
    "00326149",
    "00312446",
    "00314420",
    "00319899",
    "00356038",
    "00364260",
    "00371385",
    "00376860",
    "00381374",
    "00404894",
    "00406283",
    "00416064",
    "00389162",
    "00423494",
    "00462388",
    "00482449",
    "00516878",
    "00555833",
    "00580631",
    "00632623",
    "00638264",
    "00653082",
    "00704221",
    "00735297",
    "00772805",
    "00824641",
    "00963442",
    "00996059",
    "01011091",
    "01015972",
    "01056254",
    "01066528",
    "01068285",
    "01124626",
    "01124972",
    "01126945",
    "01126983",
    "01125791",
    "01307057",
    "01330688",
    "01324741",
    "01380428",
    "01424667",
    "01512892",
    "01531321",
    "01534851",
    "01556187",
    "01568490",
    "01588920",
    "01594070",
  ];

  if (casePage) {
    console.log(`Obtendo os casos da página ${casePage}...`);
    const options = {
      subject: "Informação - Embarque - Horário",
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
