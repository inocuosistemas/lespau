const { copyFileSync, existsSync, statSync } = require("node:fs");
const { join } = require("node:path");

const source = join(process.cwd(), "prisma", "dev.db");
const target = join(process.cwd(), "prisma", "catalog.db");

if (!existsSync(source)) {
  console.error("Missing prisma/dev.db. Run migrations and import official data first.");
  process.exit(1);
}

copyFileSync(source, target);
const sizeMb = (statSync(target).size / 1024 / 1024).toFixed(1);
console.log(`Prepared static SQLite snapshot at prisma/catalog.db (${sizeMb} MB)`);
