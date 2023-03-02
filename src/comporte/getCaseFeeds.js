const { default: axios } = require("axios");
const { GET_COMPORTE_CASE_FEEDS } = require("../config/api");

/**
 * @param {String} caseId
 * @param {Number} page
 * @returns {Promise<Array>}
 */
const getCaseFeeds = async (caseId, page = 1, limit = 100) => {
  const { url, headers } = GET_COMPORTE_CASE_FEEDS(caseId, page, limit);
  const feeds = [];

  while (true) {
    try {
      const { data } = await axios({ url, headers });

      if (data?.feeds?.length) {
        feeds.push(...data.feeds);

        if (data.feeds.length < 100) {
          break;
        }

        page++;
      } else {
        break;
      }
    } catch (error) {
      console.log(
        `Erro ao obter os feeds do casos da página ${page} com limite de ${limit} feeds.`
      );
      console.log(error?.response?.data || error?.response || error);
    }
  }

  return feeds;
};

module.exports = getCaseFeeds;
