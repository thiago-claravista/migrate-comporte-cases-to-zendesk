const { default: axios } = require("axios");
const { GET_COMPORTE_CASES } = require("../config/api");

const getCases = async (page = 1, limit = 100, options) => {
  const { url, headers } = GET_COMPORTE_CASES(page, limit, options);

  try {
    const { data } = await axios({ url, headers });
    return data.cases;
  } catch (error) {
    console.log(`Erro ao obter os casos da página ${page} em Comporte`);
    throw {
      endpoint: JSON.stringify(url),
      page,
      message: error.response?.data || error.response,
    };
  }
};

module.exports = getCases;
