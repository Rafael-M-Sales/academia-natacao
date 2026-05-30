#!/usr/bin/env node
/**
 * Importa alunos_importados.csv para o PostgreSQL.
 * Uso: node scripts/import-alunos-csv.js [caminho-do.csv] [--replace]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { initDatabase, getAcademyData, setAcademyData } from "../server/db/database.js";
import { parseAlunosCsv, mergeImportedRows } from "../server/utils/natacaoImport.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const replace = args.includes("--replace");
const fileArg = args.find((a) => !a.startsWith("--"));
const csvPath =
  fileArg ||
  path.join(__dirname, "..", "data", "imports", "alunos_importados.csv");

async function main() {
  if (!fs.existsSync(csvPath)) {
    console.error(`Arquivo não encontrado: ${csvPath}`);
    console.error(
      "Coloque alunos_importados.csv em data/imports/ ou passe o caminho como argumento."
    );
    process.exit(1);
  }

  const csv = fs.readFileSync(csvPath, "utf8");
  await initDatabase();
  const current = await getAcademyData();
  const rows = parseAlunosCsv(csv);
  const merged = mergeImportedRows(rows, {
    students: current.students,
    classes: current.classes,
    replace,
  });

  await setAcademyData({
    students: merged.students,
    classes: merged.classes,
  });

  console.log("Importação concluída:");
  console.log(JSON.stringify(merged.stats, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
