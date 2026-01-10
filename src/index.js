const { sync } = require("./sync");

sync()
  .catch(err => {
    console.error("❌ Fatal sync error:", err);
    process.exit(1);
  });
