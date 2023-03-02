const localeDateString = (_date = Date.now()) => {
  if (!_date) return "Data ausente";

  const date = new Date(_date);
  const day = String(date.getDate());
  const month = String(date.getMonth() + 1);
  const year = String(date.getFullYear());
  const hours = String(date.getHours());
  const minutes = String(date.getMinutes());
  return `${day.padStart(2, 0)}/${month.padStart(
    2,
    0
  )}/${year} ${hours.padStart(2, 0)}:${minutes.padStart(2, 0)}`;
};

module.exports = localeDateString;
