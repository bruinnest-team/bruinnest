const env = require("./config/env");
const initializeDatabase = require("./config/initDatabase");
const app = require("./app");

initializeDatabase();

app.listen(env.port, () => {
  console.log(`BruinNest server listening on http://localhost:${env.port}`);
});
