import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getAcademyData, setAcademyData } from "../db/database.js";

const router = express.Router();

router.get("/", requireAuth, async (_req, res) => {
  res.json(await getAcademyData());
});

router.put("/", requireAuth, async (req, res) => {
  const { students, classes, presenceHistory, employees, employeePresence } =
    req.body;
  const updated = await setAcademyData({
    students,
    classes,
    presenceHistory,
    employees,
    employeePresence,
  });
  res.json(updated);
});

export default router;
