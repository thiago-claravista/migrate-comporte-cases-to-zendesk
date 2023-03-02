const { default: axios } = require("axios");
const { PUT_ZENDESK_ID_ON_CASE } = require("../config/api");

const putTicketIdInDatabaseRecord = async (caseId, ticketId) => {
  const { url, headers } = PUT_ZENDESK_ID_ON_CASE(caseId);
  const data = JSON.stringify({ ticket_id: ticketId });

  try {
    await axios({
      url,
      headers,
      method: "put",
      data,
    });
  } catch (error) {
    console.log(
      "Erro ao atualizar o registro do caso no banco de dados com o ID do ticket da Zendesk"
    );
    throw {
      endpoint: JSON.stringify(url),
      payload: data,
      message: error.response?.data || error.response,
    };
  }
};

module.exports = putTicketIdInDatabaseRecord;
