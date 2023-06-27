const fs = require("fs");

const readGroupCompany = () => {
  const csv = fs.readFileSync("./src/files/de-para-empresa-grupo.csv", "utf-8");
  const rows = csv.split(/\r?\n/);
  const groupCompanies = {};

  for (let i = 1; i < rows.length; i++) {
    const [empresa_grupo_sf, empresa_grupo_zd, tag, field_id] =
      rows[i].split(";");

    if (empresa_grupo_sf) {
      groupCompanies[empresa_grupo_sf] = {
        value: tag,
        id: Number(field_id),
      };
    }
  }

  return groupCompanies;
};

module.exports = readGroupCompany;
