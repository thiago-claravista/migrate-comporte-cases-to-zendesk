/**
 * @param {String} string
 * @returns {String}
 */
const cleanString = (string = "") => {
  return string
    ?.toLowerCase()
    .replace(/\s?[-/–]\s?|\s/g, "_")
    .replace(/[\.ª]/g, "");
};

module.exports = cleanString;
