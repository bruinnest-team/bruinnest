const fs = require("fs");
const path = require("path");
const env = require("../config/env");

const uploadsDir = path.resolve(__dirname, "../../uploads/avatars");
const dbPath = env.databasePath;

function clean() {
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log(`Deleted database: ${dbPath}`);
  }

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
