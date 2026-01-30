function getNextDate(lastDate, interval) {
  const d = new Date(lastDate);
  d.setDate(d.getDate() + Number(interval));
  return d.toISOString().split("T")[0];
}

module.exports = getNextDate;
