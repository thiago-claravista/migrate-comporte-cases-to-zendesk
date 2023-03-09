const fs = require("fs");

const updateArrayIndex = (index) => {
  const logPath = "src/log";
  const filename = `arrIndex.json`;
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

  logJson["index"] = Number(index);
  fs.writeFileSync(filePath, JSON.stringify(logJson, null, 2));
};

module.exports = updateArrayIndex;
