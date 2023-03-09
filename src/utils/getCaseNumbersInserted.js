const getCaseNumbersInserted = () => {
  try {
    const successLog = require("../log/success.json");
    return Object.keys(successLog);
  } catch (error) {
    return [];
  }
};

module.exports = getCaseNumbersInserted;
