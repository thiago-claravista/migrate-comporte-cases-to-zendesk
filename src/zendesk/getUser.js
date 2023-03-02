const { default: axios } = require("axios");
const { GET_ZENDESK_USER } = require("../config/api");

const getUser = async (keyValueParam) => {
  const { url, headers } = GET_ZENDESK_USER(keyValueParam);

  try {
    const { data } = await axios({
      url,
      headers,
    });

    return data?.users;
  } catch (error) {
    console.log("Erro ao buscar o usuário na Zendesk");
    throw {
      endpoint: JSON.stringify(url),
      message: error.response?.data || error.response,
    };
  }
};

module.exports = getUser;
