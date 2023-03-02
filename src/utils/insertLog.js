const fs = require("fs");

/**
 * @param {Object} data
 * @param {Boolean} error
 */
const insertLog = (data, error) => {
  const logPath = "src/log";
  const filename = `${error ? "errors" : "success"}.json`;
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
  const logJson = JSON.parse(logString || "[]");
  const log = {
    ...data,
    register_date: new Date().toJSON(),
  };

  logJson.push(log);
  fs.writeFileSync(filePath, JSON.stringify(logJson, null, 2));
};

module.exports = insertLog;
