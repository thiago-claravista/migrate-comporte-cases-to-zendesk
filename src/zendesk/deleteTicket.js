const { default: axios } = require("axios");
const { DELETE_ZENDESK_TICKET } = require("../config/api");

const deleteTicket = async (ticketId) => {
  const { url, headers } = DELETE_ZENDESK_TICKET(ticketId);

  try {
    await axios({
      method: "delete",
      url,
      headers,
    });
  } catch (error) {
    console.log("Erro ao deletar o ticket na Zendesk");
    throw {
      message: error.response?.data || error.response,
      ticket_id: ticketId,
    };
  }
};

module.exports = deleteTicket;
