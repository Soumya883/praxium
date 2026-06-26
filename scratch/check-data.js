const { db } = require("./db/index");
const { institutes } = require("./db/schema");

async function main() {
  try {
    const inst = await db.select().from(institutes);
    console.log("Found institutes:", inst);
  } catch (err) {
    console.error("DB Query failed:", err);
  }
}

main();
