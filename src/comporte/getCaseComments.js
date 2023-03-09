const { default: axios } = require("axios");
const { GET_COMPORTE_CASE_COMMENTS } = require("../config/api");

/**
 * @param {String} caseId
 * @param {Number} page
 * @returns {Promise<Array>}
 */
const getCaseComments = async (caseId, page = 1, limit = 100) => {
  const { url, headers } = GET_COMPORTE_CASE_COMMENTS(caseId, page, limit);
  const comments = [];

  while (true) {
    try {
      const { data } = await axios({ url, headers });

      if (data?.comments?.length) {
        comments.push(...data.comments);

        if (data.comments.length < limit) {
          break;
        }

        page++;
      } else {
        break;
      }
    } catch (error) {
      console.log(
        `Erro ao obter os comentários do casos da página ${page} com limite de ${limit} comentários.`
      );
      console.log(error?.response?.data || error?.response || error);
    }
  }

  return comments;
};

module.exports = getCaseComments;
