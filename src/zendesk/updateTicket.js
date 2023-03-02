const { default: axios } = require("axios");
const { UPDATE_ZENDESK_TICKET } = require("../config/api");

const updateTicket = async (payload, ticketId) => {
  const { url, headers } = UPDATE_ZENDESK_TICKET(ticketId);

  try {
    const { data } = await axios({
      method: "put",
      url,
      headers,
      data: JSON.stringify(payload),
    });

    return data;
  } catch (error) {
    console.log("Erro ao atualizar o ticket na Zendesk");
    throw {
      payload: JSON.stringify(payload),
      message: error.response?.data || error.response,
      ticket_id: ticketId,
    };
  }
};

module.exports = updateTicket;
