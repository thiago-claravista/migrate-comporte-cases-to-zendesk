const fs = require("fs");

const getAttachmentFile = (filename) => {
  try {
    const file = fs.readFileSync(`src/files/attachments/${filename}`);
    return file;
  } catch (error) {
    console.log(`Anexo ${filename} não encontrado!`);
  }
};

module.exports = getAttachmentFile;
