const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const dbPromise = open({
  filename: "farm.db",
  driver: sqlite3.Database
});

module.exports = dbPromise;
