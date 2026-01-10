require("dotenv").config();
const { sync } = require("./sync");


(async () => {
  console.log("🚀 Running FULL initial sync...");
  await sync({ full: true });
  console.log("✅ Initial sync finished");
})();
