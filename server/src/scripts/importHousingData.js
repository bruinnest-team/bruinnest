const fs = require("fs");
const path = require("path");
const env = require("../config/env");
const initializeDatabase = require("../config/initDatabase");

const importPath = path.resolve(
  __dirname,
  "../../database/import-data/westwood-rentals.json"
);

function importHousingData() {
  initializeDatabase();

  const housingService = require("../services/housingService");
  const rawData = fs.readFileSync(importPath, "utf8");
  const dataset = JSON.parse(rawData);
  const summary = housingService.importHousingCatalog(dataset.listings, {
    source: dataset.meta && dataset.meta.source,
  });

  console.log(
    `Imported ${summary.total} housing listings into ${env.databasePath} ` +
      `(${summary.created} created, ${summary.updated} updated).`
  );
}

importHousingData();
