import express from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { getAcademyData, setAcademyData } from "../db/database.js";
import { validate } from "../middleware/validate.js";
import {
  parseAlunosCsv,
  mergeImportedRows,
  buildPoolMap,
} from "../utils/natacaoImport.js";

const csvImportSchema = z.object({
  csv: z.string().min(1, 'CSV não pode estar vazio'),
  replace: z.boolean().optional().default(false),
});

const router = express.Router();

router.post("/alunos-csv", requireAuth, validate(csvImportSchema), async (req, res) => {
  try {
    const { csv, replace } = req.body;

    const rows = parseAlunosCsv(csv);
    const current = await getAcademyData();
    const merged = mergeImportedRows(rows, {
      students: current.students,
      classes: current.classes,
      replace: Boolean(replace),
    });

    const updated = await setAcademyData({
      students: merged.students,
      classes: merged.classes,
    });

    res.json({
      stats: merged.stats,
      students: updated.students,
      classes: updated.classes,
    });
  } catch (err) {
    res.status(400).json({ message: err.message || "Falha na importação" });
  }
});

router.get("/pool-map", requireAuth, async (req, res) => {
  const { time, day } = req.query;
  const data = await getAcademyData();
  res.json(buildPoolMap(data.students, data.classes, { time, day }));
});

export default router;
