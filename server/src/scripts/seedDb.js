const fs = require("fs");
const path = require("path");
const db = require("../config/db");
const env = require("../config/env");
const initializeDatabase = require("../config/initDatabase");

const seedPath = path.resolve(__dirname, "../../database/seed.sql");
const seedAvatarsDir = path.resolve(__dirname, "../../database/seed-assets/avatars");
const uploadsAvatarsDir = path.resolve(__dirname, "../../uploads/avatars");

function importSeedAvatars() {
  if (!fs.existsSync(seedAvatarsDir)) {
    console.warn(`No seed avatars found at ${seedAvatarsDir}; skipping avatar import.`);
    return;
  }

  fs.mkdirSync(uploadsAvatarsDir, { recursive: true });

  const files = fs
    .readdirSync(seedAvatarsDir)
    .filter((file) => file !== ".gitkeep");

  for (const file of files) {
    fs.copyFileSync(path.join(seedAvatarsDir, file), path.join(uploadsAvatarsDir, file));
  }

  console.log(`Imported ${files.length} seed avatars into ${uploadsAvatarsDir}`);
}

function seedDatabase() {
  initializeDatabase();
  importSeedAvatars();

  const seedSql = fs.readFileSync(seedPath, "utf8");
  db.exec(seedSql);

  console.log(`Seeded local development data into ${env.databasePath}`);
}

seedDatabase();
