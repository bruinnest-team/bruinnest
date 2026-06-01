const fs = require("fs");
const path = require("path");
const db = require("./db");

const schemaPath = path.resolve(__dirname, "../../database/schema.sql");

function initializeDatabase() {
  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  db.exec(schemaSql);
}

module.exports = initializeDatabase;
