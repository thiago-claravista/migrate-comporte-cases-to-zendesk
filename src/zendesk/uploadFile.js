const { default: axios } = require("axios");
const { UPLOAD_ZENDESK_FILE } = require("../config/api");

const uploadFile = async (
  filename,
  file,
  contentType = "application/binary"
) => {
  const { url, headers } = UPLOAD_ZENDESK_FILE(filename, contentType);

  try {
    const { data } = await axios({
      method: "POST",
      url,
      headers,
      data: file,
    });

    return data.upload;
  } catch (error) {
    console.log(`Erro ao fazer upload de um arquivo na Zendesk:`);
    console.log(error.response?.data || error.response);
  }
};

module.exports = uploadFile;
