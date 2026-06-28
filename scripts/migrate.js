const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Try different connection methods
const configs = [
  {
    name: "Pooler (Session mode)",
    connectionString:
      "postgresql://postgres.foknmqtemkfperlccpdz:9DMDFewyEirQglEh@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres",
  },
  {
    name: "Pooler (Transaction mode port 6543)",
    connectionString:
      "postgresql://postgres.foknmqtemkfperlccpdz:9DMDFewyEirQglEh@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres",
  },
  {
    name: "Direct connection",
    host: "db.foknmqtemkfperlccpdz.supabase.co",
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: "9DMDFewyEirQglEh",
  },
];

const sql = fs.readFileSync(
  path.join(__dirname, "..", "supabase", "migrations", "001_initial_schema.sql"),
  "utf-8"
);

async function tryConfig(config) {
  const pool = new Pool({
    ...config,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log(`\nTrying: ${config.name || config.connectionString}...`);
    const client = await pool.connect();
    console.log(`Connected via ${config.name}!`);

    // Check if tables already exist
    const { rows: existing } = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    );
    if (existing.length > 0) {
      console.log("Tables already exist:");
      existing.forEach((r) => console.log(`  ✅ ${r.table_name}`));
      client.release();
      await pool.end();
      return true;
    }

    console.log("Running migration...");
    await client.query(sql);
    console.log("Migration executed!");

    const { rows } = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
    );
    console.log("Tables created:");
    rows.forEach((r) => console.log(`  ✅ ${r.table_name}`));

    client.release();
    await pool.end();
    return true;
  } catch (err) {
    console.log(`  ❌ ${err.message}`);
    try { await pool.end(); } catch {}
    return false;
  }
}

async function main() {
  for (const config of configs) {
    const ok = await tryConfig(config);
    if (ok) {
      console.log("\n🎉 Migration complete!");
      process.exit(0);
    }
  }
  console.error("\nAll connection methods failed.");
  process.exit(1);
}

main();
