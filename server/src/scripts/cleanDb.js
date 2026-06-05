const fs = require("fs");
const path = require("path");
const env = require("../config/env");

const uploadsDir = path.resolve(__dirname, "../../uploads/avatars");
const dbPath = env.databasePath;
const dbSidecarPaths = [
  dbPath,
  `${dbPath}-wal`,
  `${dbPath}-shm`,
  `${dbPath}-journal`,
];

function deleteIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted database file: ${filePath}`);
  }
}

function clean() {
  dbSidecarPaths.forEach(deleteIfExists);

  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    files.forEach((file) => {
      if (file !== ".gitkeep") {
        fs.unlinkSync(path.join(uploadsDir, file));
        console.log(`Deleted upload: uploads/avatars/${file}`);
      }
    });
  }

  console.log("Cleanup complete.");
}

clean();
