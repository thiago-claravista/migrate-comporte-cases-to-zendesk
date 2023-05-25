const fs = require("fs");

const readReasons = () => {
  const csv = fs.readFileSync("./src/files/de-para-reasons.csv", "utf-8");
  const rows = csv.split(/\r?\n/);
  const reasons = { empty_reasons: [] };

  for (let i = 1; i < rows.length; i++) {
    const [subject, reason, tag, field_id] = rows[i].split(";");

    if (subject) {
      reasons[subject] = {
        reason: tag,
        reason_field_id: Number(field_id),
      };
    } else {
      const [prevSubject] = rows[i - 1].split(";");

      if (reasons[prevSubject]) {
        reasons[prevSubject].subreason = tag;
        reasons[prevSubject].subreason_field_id = Number(field_id);
      } else {
        reasons.empty_reasons.push({
          reason: tag,
          reason_field_id: Number(field_id),
        });
      }
    }
  }

  return reasons;
};

module.exports = readReasons;
