const fs = require("fs");
const path = require("path");
const db = require("../config/db");
const env = require("../config/env");
const initializeDatabase = require("../config/initDatabase");

const seedPath = path.resolve(__dirname, "../../database/seed.sql");

function seedDatabase() {
  initializeDatabase();

  const seedSql = fs.readFileSync(seedPath, "utf8");
  db.exec(seedSql);

  console.log(`Seeded local development data into ${env.databasePath}`);
}

seedDatabase();
