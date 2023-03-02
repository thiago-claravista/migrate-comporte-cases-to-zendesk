const { default: axios } = require("axios");
const { GET_COMPORTE_CASE_ATTACHMENTS } = require("../config/api");

/**
 * @param {String} caseId
 * @param {Number} page
 * @returns {Promise<Array>}
 */
const getAttachments = async (caseId, page = 1, limit = 100) => {
  const { url, headers } = GET_COMPORTE_CASE_ATTACHMENTS(caseId, page, limit);
  const attachments = [];

  while (true) {
    try {
      const { data } = await axios({ url, headers });

      if (data?.attachments?.length) {
        attachments.push(...data.attachments);

        if (data.attachments.length < 100) {
          break;
        }

        page++;
      } else {
        break;
      }
    } catch (error) {
      console.log(`Erro ao obter os anexos do caso ${caseId}.`);
      console.log(error?.response?.data || error?.response || error);
    }
  }

  return attachments;
};

module.exports = getAttachments;
