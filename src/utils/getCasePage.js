const getCasePage = () => {
  try {
    const casePage = require("../log/casePage.json");
    return Number(casePage.page);
  } catch (error) {
    return 1;
  }
};

module.exports = getCasePage;
