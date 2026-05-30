import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import {
  getAcademyData,
  setAcademyData,
  subscribeLive,
} from "../db/database.js";
import { INSTRUCTORS } from "../../src/data/mockData.js";
import { JWT_SECRET, TEACHER_PIN } from "../config.js";
import { validate } from "../middleware/validate.js";

const loginSchema = z.object({
  instructorId: z.number({ coerce: true }),
  pin: z.string().min(1),
});

const sessionSchema = z.object({
  classId: z.number({ coerce: true }),
});

const presenceSchema = z.object({
  studentId: z.number({ coerce: true }),
  classId: z.number({ coerce: true }),
  status: z.enum(["Presente", "Falta"]),
});

const router = express.Router();

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function verifyTeacher(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token de professor ausente" });
  }
  try {
    const payload = jwt.verify(auth.split(" ")[1], JWT_SECRET);
    if (payload.role !== "teacher") {
      return res.status(403).json({ message: "Acesso apenas para professores" });
    }
    req.teacher = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
}

router.post("/teacher-login", validate(loginSchema), (req, res) => {
  const { instructorId, pin } = req.body;
  const instructor = INSTRUCTORS.find((i) => i.id === Number(instructorId));
  if (!instructor || pin !== TEACHER_PIN) {
    return res.status(401).json({ message: "Professor ou PIN inválido (demo: PIN 1234)" });
  }
  const token = jwt.sign(
    { id: instructor.id, name: instructor.name, role: "teacher" },
    JWT_SECRET,
    { expiresIn: "12h" }
  );
  res.json({ token, instructor });
});

router.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const send = async () => {
    try {
      const data = await getAcademyData();
      res.write(
        `data: ${JSON.stringify({
          liveSessions: data.liveSessions,
          pedagogyNotes: data.pedagogyNotes.slice(-30),
          presenceHistory: data.presenceHistory.filter((p) => p.date === todayISO()),
          students: data.students,
          classes: data.classes,
          updatedAt: data.updatedAt,
        })}\n\n`
      );
    } catch (e) {
      console.error("[SSE] Error sending data:", e);
    }
  };

  send();
  const unsub = subscribeLive(send);
  const heartbeat = setInterval(send, 3000);
  req.on("close", () => {
    clearInterval(heartbeat);
    unsub();
  });
});

router.get("/my-classes", verifyTeacher, async (req, res) => {
  const data = await getAcademyData();
  const classes = data.classes.filter((c) => c.instructorId === req.teacher.id);
  res.json({ classes, students: data.students, liveSessions: data.liveSessions });
});

router.get("/state", async (_req, res) => {
  const data = await getAcademyData();
  res.json({
    liveSessions: data.liveSessions.filter((s) => s.status === "active"),
    pedagogyNotes: data.pedagogyNotes.slice(-30),
    today: todayISO(),
  });
});

router.post("/session/start", verifyTeacher, validate(sessionSchema), async (req, res) => {
  const { classId } = req.body;
  const data = await getAcademyData();
  const cls = data.classes.find((c) => c.id === Number(classId));
  if (!cls) return res.status(404).json({ message: "Turma não encontrada" });

  const sessions = data.liveSessions.filter((s) => s.status !== "active");
  const session = {
    id: Date.now(),
    classId: cls.id,
    className: cls.name,
    instructorId: req.teacher.id,
    instructorName: req.teacher.name,
    startedAt: new Date().toISOString(),
    status: "active",
    presentCount: 0,
  };
  sessions.push(session);
  const updated = await setAcademyData({ ...data, liveSessions: sessions });
  res.json({ session, data: updated });
});

router.post("/session/end", verifyTeacher, async (req, res) => {
  const data = await getAcademyData();
  const sessions = data.liveSessions.map((s) =>
    s.instructorId === req.teacher.id && s.status === "active"
      ? { ...s, status: "ended", endedAt: new Date().toISOString() }
      : s
  );
  const updated = await setAcademyData({ ...data, liveSessions: sessions });
  res.json({ ok: true, data: updated });
});

router.post("/presence", verifyTeacher, validate(presenceSchema), async (req, res) => {
  const { studentId, classId, status } = req.body;
  const data = await getAcademyData();
  const today = todayISO();
  let presenceHistory = data.presenceHistory.filter(
    (h) =>
      !(
        h.studentId === Number(studentId) &&
        h.classId === Number(classId) &&
        h.date === today
      )
  );
  presenceHistory.push({
    studentId: Number(studentId),
    classId: Number(classId),
    date: today,
    status,
    recordedBy: req.teacher.name,
    recordedAt: new Date().toISOString(),
  });

  const sessions = data.liveSessions.map((s) => {
    if (s.instructorId === req.teacher.id && s.status === "active" && s.classId === Number(classId)) {
      const present = presenceHistory.filter(
        (h) => h.classId === s.classId && h.date === today && h.status === "Presente"
      ).length;
      return { ...s, presentCount: present };
    }
    return s;
  });

  const updated = await setAcademyData({ ...data, presenceHistory, liveSessions: sessions });
  res.json({ ok: true, data: updated });
});

router.post("/pedagogy", verifyTeacher, async (req, res) => {
  const { studentId, note, skill } = req.body;
  const data = await getAcademyData();
  const student = data.students.find((s) => s.id === Number(studentId));
  if (!student) return res.status(404).json({ message: "Aluno não encontrado" });

  const entry = {
    id: Date.now(),
    studentId: student.id,
    studentName: student.name,
    modality: student.modality,
    level: student.level,
    note: note || "",
    skill: skill || "Evolução em aula",
    instructorId: req.teacher.id,
    instructorName: req.teacher.name,
    createdAt: new Date().toISOString(),
  };

  const pedagogyNotes = [entry, ...data.pedagogyNotes].slice(0, 200);
  const updated = await setAcademyData({ ...data, pedagogyNotes });
  res.json({ entry, data: updated });
});

router.post("/voice", verifyTeacher, async (req, res) => {
  const { transcript, classId } = req.body;
  const text = (transcript || "").toLowerCase().trim();
  const data = await getAcademyData();
  const cls = data.classes.find((c) => c.id === Number(classId));
  if (!cls) return res.status(400).json({ message: "Turma não selecionada" });

  const studentsInClass = data.students.filter((s) => cls.students.includes(s.id));

  const findStudent = (fragment) => {
    const f = fragment.toLowerCase();
    return studentsInClass.find((s) => s.name.toLowerCase().includes(f));
  };

  if (/iniciar aula|começar aula|abrir aula/.test(text)) {
    const sessions = data.liveSessions.filter((s) => s.status !== "active");
    const session = {
      id: Date.now(),
      classId: cls.id,
      className: cls.name,
      instructorId: req.teacher.id,
      instructorName: req.teacher.name,
      startedAt: new Date().toISOString(),
      status: "active",
      presentCount: 0,
    };
    sessions.push(session);
    const updated = await setAcademyData({ ...data, liveSessions: sessions });
    return res.json({ action: "session_start", message: `Aula ${cls.name} iniciada.`, session, data: updated });
  }

  if (/encerrar aula|finalizar aula|terminar aula/.test(text)) {
    const sessions = data.liveSessions.map((s) =>
      s.instructorId === req.teacher.id && s.status === "active"
        ? { ...s, status: "ended", endedAt: new Date().toISOString() }
        : s
    );
    await setAcademyData({ ...data, liveSessions: sessions });
    return res.json({ action: "session_end", message: "Aula encerrada." });
  }

  const presentMatch = text.match(/(?:presente|marcar presente|chegou)\s+(.+)/);
  if (presentMatch) {
    const student = findStudent(presentMatch[1]);
    if (!student) return res.json({ action: "error", message: `Aluno não encontrado: ${presentMatch[1]}` });
    req.body = { studentId: student.id, classId, status: "Presente" };
    const today = todayISO();
    let presenceHistory = data.presenceHistory.filter(
      (h) => !(h.studentId === student.id && h.classId === Number(classId) && h.date === today)
    );
    presenceHistory.push({
      studentId: student.id,
      classId: Number(classId),
      date: today,
      status: "Presente",
      recordedBy: req.teacher.name,
      recordedAt: new Date().toISOString(),
    });
    const updated = await setAcademyData({ ...data, presenceHistory });
    return res.json({ action: "presence", message: `${student.name} marcado presente.`, data: updated });
  }

  const absentMatch = text.match(/(?:falta|ausente|faltou)\s+(.+)/);
  if (absentMatch) {
    const student = findStudent(absentMatch[1]);
    if (!student) return res.json({ action: "error", message: `Aluno não encontrado: ${absentMatch[1]}` });
    const today = todayISO();
    let presenceHistory = data.presenceHistory.filter(
      (h) => !(h.studentId === student.id && h.classId === Number(classId) && h.date === today)
    );
    presenceHistory.push({
      studentId: student.id,
      classId: Number(classId),
      date: today,
      status: "Falta",
      recordedBy: req.teacher.name,
      recordedAt: new Date().toISOString(),
    });
    const updated = await setAcademyData({ ...data, presenceHistory });
    return res.json({ action: "presence", message: `${student.name} marcado falta.`, data: updated });
  }

  const evoMatch = text.match(/(?:evolução|evoluiu|progresso|registrar)\s+(.+)/);
  if (evoMatch) {
    const rest = evoMatch[1];
    const student = studentsInClass.find((s) => rest.toLowerCase().startsWith(s.name.toLowerCase().split(" ")[0]));
    const matched =
      student ||
      studentsInClass.find((s) => rest.toLowerCase().includes(s.name.toLowerCase().split(" ")[0]));
    if (!matched) return res.json({ action: "error", message: "Não entendi o nome do aluno na evolução." });
    const note = rest.replace(matched.name.split(" ")[0], "").trim() || "Evolução registrada em aula";
    const entry = {
      id: Date.now(),
      studentId: matched.id,
      studentName: matched.name,
      modality: matched.modality,
      level: matched.level,
      note,
      skill: "Aula ao vivo",
      instructorId: req.teacher.id,
      instructorName: req.teacher.name,
      createdAt: new Date().toISOString(),
    };
    const updated = await setAcademyData({
      ...data,
      pedagogyNotes: [entry, ...data.pedagogyNotes].slice(0, 200),
    });
    return res.json({ action: "pedagogy", message: `Evolução de ${matched.name} registrada.`, data: updated });
  }

  res.json({
    action: "unknown",
    message:
      'Comandos: "presente [nome]", "falta [nome]", "evolução [nome] [texto]", "encerrar aula"',
  });
});

export default router;
