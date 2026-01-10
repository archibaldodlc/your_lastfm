require("dotenv").config();
const cron = require("node-cron");
const sync = require("./sync");

let running = false;

cron.schedule("*/5 * * * *", async () => {
  if (running) return;

  running = true;
  try {
    await sync();
    console.log("✅ Cron sync completed");
  } catch (err) {
    console.error("❌ Sync error:", err);
  } finally {
    running = false;
  }
});
