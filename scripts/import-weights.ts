import { createReadStream } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Row = {
  degreeCode: string;
  degreeName: string;
  universityCode: string;
  subjectCode: string;
  subjectName: string;
  weight: number;
};

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function parseRow(headers: string[], cells: string[]): Row {
  const record = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
  return {
    degreeCode: record.degree_code,
    degreeName: record.degree_name,
    universityCode: record.university_code,
    subjectCode: record.subject_code,
    subjectName: record.subject_name,
    weight: Number(record.weight)
  };
}

async function importRow(row: Row) {
  if (!row.degreeCode || !row.subjectCode || ![0.1, 0.2].includes(row.weight)) {
    throw new Error(`Fila invalida: ${JSON.stringify(row)}`);
  }

  const subject = await prisma.subject.upsert({
    where: { code: row.subjectCode },
    update: { name: row.subjectName || row.subjectCode },
    create: {
      code: row.subjectCode,
      name: row.subjectName || row.subjectCode,
      category: "importada"
    }
  });

  const degree = await prisma.degree.findUnique({ where: { code: row.degreeCode } });
  if (!degree) {
    console.warn(`Grado no encontrado (${row.degreeCode}). Se omite ponderacion para ${row.subjectCode}.`);
    return;
  }

  await prisma.degreeSubjectWeight.upsert({
    where: {
      degreeId_subjectId: {
        degreeId: degree.id,
        subjectId: subject.id
      }
    },
    update: { weight: row.weight, source: "csv" },
    create: {
      degreeId: degree.id,
      subjectId: subject.id,
      weight: row.weight,
      source: "csv"
    }
  });
}

async function main() {
  const file = resolve(process.argv[2] ?? "data/sample-ponderacions.csv");
  const stream = createInterface({ input: createReadStream(file), crlfDelay: Infinity });
  let headers: string[] | null = null;
  let count = 0;

  for await (const line of stream) {
    if (!line.trim()) continue;
    const cells = parseCsvLine(line);
    if (!headers) {
      headers = cells;
      continue;
    }
    await importRow(parseRow(headers, cells));
    count += 1;
  }

  console.log(`Importadas ${count} filas desde ${file}`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
