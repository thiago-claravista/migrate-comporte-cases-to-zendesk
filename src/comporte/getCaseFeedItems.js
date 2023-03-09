const { default: axios } = require("axios");
const { GET_COMPORTE_CASE_FEED_ITEMS } = require("../config/api");

/**
 * @param {String} caseId
 * @param {Number} page
 * @returns {Promise<Array>}
 */
const getCaseFeedItems = async (caseId, page = 1, limit = 100) => {
  const { url, headers } = GET_COMPORTE_CASE_FEED_ITEMS(caseId, page, limit);
  const feedItems = [];

  while (true) {
    try {
      const { data } = await axios({ url, headers });

      if (data?.feedItems?.length) {
        feedItems.push(...data.feedItems);

        if (data.feedItems.length < limit) {
          break;
        }

        page++;
      } else {
        break;
      }
    } catch (error) {
      console.log(
        `Erro ao obter os feedItems do casos da página ${page} com limite de ${limit} feeds.`
      );
      console.log(error?.response?.data || error?.response || error);
    }
  }

  return feedItems;
};

module.exports = getCaseFeedItems;
