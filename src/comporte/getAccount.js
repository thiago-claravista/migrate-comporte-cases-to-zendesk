const { default: axios } = require("axios");
const { GET_COMPORTE_ACCOUNT } = require("../config/api");

const getAccount = async (accountId) => {
  const { url, headers } = GET_COMPORTE_ACCOUNT(accountId);

  try {
    const { data } = await axios({ url, headers });
    return data.accounts?.[0];
  } catch (error) {
    console.log(`Erro ao obter a conta ${accountId}:`);
    console.log(error?.response?.data || error?.response || error);
  }
};

module.exports = getAccount;
