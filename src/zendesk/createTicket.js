const { default: axios } = require("axios");
const { CREATE_ZENDESK_TICKET } = require("../config/api");

const createTicket = async (payload) => {
  const { url, headers } = CREATE_ZENDESK_TICKET();

  try {
    const { data } = await axios({
      method: "post",
      url,
      headers,
      data: JSON.stringify(payload),
    });

    return data.ticket;
  } catch (error) {
    console.log("Erro ao criar o ticket na Zendesk");
    throw {
      payload: JSON.stringify(payload),
      message: error.response?.data || error.response,
    };
  }
};

module.exports = createTicket;
