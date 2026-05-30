// server/routes/reports.js
import express from "express";
import { AsyncParser } from "@json2csv/node";
import { generateReportPDF } from "../utils/pdfGenerator.js";
import { requireAuth } from "../middleware/auth.js";
import { getAcademyData } from "../db/database.js";

const router = express.Router();

async function buildReportRows() {
  const { students } = await getAcademyData();
  return students.map((s) => ({
    student: s.name,
    modality: s.modality,
    frequency: s.frequencyRate ?? 0,
    payments: s.paymentsStatus,
    delinquent: s.paymentsStatus === "Atrasado",
  }));
}

router.get("/csv", requireAuth, async (_req, res) => {
  const mockReportData = await buildReportRows();
  const fields = ["student", "modality", "frequency", "payments", "delinquent"];
  const asyncParser = new AsyncParser({ fields });
  const csv = await asyncParser.parse(mockReportData).promise();
  res.header("Content-Type", "text/csv");
  res.attachment("relatorio.csv");
  res.send(csv);
});

router.get("/pdf", requireAuth, async (_req, res) => {
  const mockReportData = await buildReportRows();
  const pdfBuffer = await generateReportPDF(mockReportData);
  res.set({ "Content-Type": "application/pdf", "Content-Disposition": "attachment; filename=relatorio.pdf" });
  res.send(pdfBuffer);
});

export default router;
