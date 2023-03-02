const { default: axios } = require("axios");
const { GET_COMPORTE_CASE } = require("../config/api");

const getCase = async (caseNumber) => {
  const { url, headers } = GET_COMPORTE_CASE(caseNumber);

  try {
    const { data } = await axios({ url, headers });
    return data.cases?.[0];
  } catch (error) {
    console.log(`Erro ao obter o caso ${caseNumber} em Comporte`);
    throw {
      endpoint: JSON.stringify(url),
      message: error.response?.data || error.response,
    };
  }
};

module.exports = getCase;
