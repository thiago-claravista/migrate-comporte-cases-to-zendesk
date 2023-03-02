const { default: axios } = require("axios");
const { CREATE_ZENDESK_USER } = require("../config/api");

const createUser = async (payload) => {
  const { url, headers } = CREATE_ZENDESK_USER();

  try {
    const { data: response } = await axios({
      method: "post",
      url,
      headers,
      data: JSON.stringify(payload),
    });

    return response;
  } catch (error) {
    console.log("Erro ao criar o usuário na Zendesk");
    throw {
      payload: JSON.stringify(payload),
      message: error.response?.data || error.response,
    };
  }
};

module.exports = createUser;
