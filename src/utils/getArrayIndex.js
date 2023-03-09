const getArrayIndex = () => {
  try {
    const arrayIndex = require("../log/arrIndex.json");
    return Number(arrayIndex.index);
  } catch (error) {
    return 0;
  }
};

module.exports = getArrayIndex;
