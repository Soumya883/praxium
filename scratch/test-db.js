const postgres = require("postgres");

const url = "postgresql://postgres:postgres@localhost:5432/praxium";
console.log("Connecting to:", url);

const sql = postgres(url, { connect_timeout: 5 });

async function main() {
  try {
    const res = await sql`SELECT 1 as conn`;
    console.log("Success:", res);
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await sql.end();
  }
}

main();
