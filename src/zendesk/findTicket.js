const { default: axios } = require("axios");
const { SEARCH_ZENDESK_TICKETS } = require("../config/api");

const findTicket = async (caseNumber) => {
  const query = `type:ticket tags:salesforce custom_field_13440909336468:${caseNumber}`;
  const { url, headers } = SEARCH_ZENDESK_TICKETS(query);

  try {
    const { data } = await axios({ url, headers });
    return !!data.results?.length;
  } catch (error) {
    console.log(`Erro ao realizar uma consulta na Zendesk:`);
    console.log(error?.response?.data || error?.response || error);
    return false;
  }
};

module.exports = findTicket;
