const { default: axios } = require("axios");
const { GET_COMPORTE_SURVEY } = require("../config/api");

/**
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Array>}
 */
const getSurvey = async (id) => {
  const { url, headers } = GET_COMPORTE_SURVEY(id);

  try {
    const { data } = await axios({ url, headers });
    return data.surveys;
  } catch (error) {
    console.log(`Erro ao obter a pesquisa de satisfação ${id}.`);
    console.log(error?.response?.data || error?.response || error);

    return [];
  }
};

module.exports = getSurvey;
