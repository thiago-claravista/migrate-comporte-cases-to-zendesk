const cleanString = require("./cleanString");

/**
 *
 * @param {String} type
 * @param {String} subject
 * @returns {String}
 */
const getSubReason = (type, subject) => {
  const [_subject] = subject?.match(/(?<=\s-\s)[A-zÀ-ú\s\/]+(?!\s-\s)$/g) || [];
  const subjectSubReason = cleanString(_subject);
  let typeSubReason = cleanString(type);

  if (typeSubReason.includes("informação")) {
    typeSubReason = typeSubReason.replace(/ç/, "c");
  }

  const subReason = `sub_motivo_${typeSubReason}_rod_${subjectSubReason}`;

  return subReason;
};

module.exports = getSubReason;
