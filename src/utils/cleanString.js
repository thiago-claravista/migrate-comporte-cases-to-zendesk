/**
 * @param {String} string
 * @returns {String}
 */
const cleanString = (string = "") => {
  return string
    ?.toLowerCase()
    .replace(/\s-\s|\s|-|\//g, "_")
    .replace(/\./g, "");
};

module.exports = cleanString;
