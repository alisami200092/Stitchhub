const postgres = require("postgres");
const fs = require("fs");
const path = require("path");

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

async function check() {
  console.log("Connecting to database...");
  const sql = postgres(process.env.DATABASE_URL, { prepare: false });
  try {
    const rows = await sql`SELECT * FROM supplier_messages ORDER BY created_at DESC LIMIT 20`;
    console.log("RECENT SUPPLIER MESSAGES:");
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error("Error running query:", err);
  } finally {
    await sql.end();
  }
}

check();
