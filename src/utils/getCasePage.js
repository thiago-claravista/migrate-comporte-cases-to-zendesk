const fs = require("fs");

const getCasePage = () => {
  const logPath = "src/log";
  const filename = `casePage.json`;
  const filePath = `${logPath}/${filename}`;
  const exists = fs.existsSync(filePath);

  // se a pasta de log não existe, será criada
  if (!fs.existsSync(logPath)) {
    fs.mkdirSync(logPath, { recursive: true });
  }

  // se houver um arquivo de log já existente, ele será lido
  const logString =
    exists &&
    fs.readFileSync(filePath, {
      encoding: "utf-8",
    });
  const logJson = JSON.parse(logString || "{}");

  return Number(logJson.page) || 1;
};

module.exports = getCasePage;
