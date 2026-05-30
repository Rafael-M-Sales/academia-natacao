import pg from "pg";
const { Pool } = pg;
import {
  INITIAL_STUDENTS,
  INITIAL_CLASSES,
  PRESENCE_HISTORY,
  INITIAL_EMPLOYEES,
  EMPLOYEE_PRESENCE,
} from "../../src/data/mockData.js";
import { DATABASE_URL } from "../config.js";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const liveListeners = new Set();

function emptyLiveExtras() {
  return { liveSessions: [], pedagogyNotes: [] };
}

async function seedState() {
  const payload = {
    students: INITIAL_STUDENTS,
    classes: INITIAL_CLASSES,
    presenceHistory: PRESENCE_HISTORY,
    employees: INITIAL_EMPLOYEES,
    employeePresence: EMPLOYEE_PRESENCE,
    ...emptyLiveExtras(),
  };
  const now = new Date().toISOString();
  await pool.query(
    `INSERT INTO academy_state (id, students, classes, presence_history, employees, employee_presence, live_sessions, pedagogy_notes, updated_at)
     VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      JSON.stringify(payload.students),
      JSON.stringify(payload.classes),
      JSON.stringify(payload.presenceHistory),
      JSON.stringify(payload.employees),
      JSON.stringify(payload.employeePresence),
      JSON.stringify(payload.liveSessions),
      JSON.stringify(payload.pedagogyNotes),
      now,
    ]
  );
  return payload;
}

export async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS academy_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      students JSONB NOT NULL,
      classes JSONB NOT NULL,
      presence_history JSONB NOT NULL,
      employees JSONB NOT NULL,
      employee_presence JSONB NOT NULL,
      live_sessions JSONB NOT NULL DEFAULT '[]',
      pedagogy_notes JSONB NOT NULL DEFAULT '[]',
      updated_at VARCHAR(50) NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS nfse_invoices (
      id SERIAL PRIMARY KEY,
      number VARCHAR(20) NOT NULL,
      series VARCHAR(5) DEFAULT '1',
      issuance_date VARCHAR(50) NOT NULL,
      provider_cnpj VARCHAR(18) NOT NULL,
      provider_name VARCHAR(255) NOT NULL,
      provider_townhouse VARCHAR(255),
      taker_cpf_cnpj VARCHAR(18) NOT NULL,
      taker_name VARCHAR(255) NOT NULL,
      service_description TEXT NOT NULL,
      service_value DECIMAL(12,2) NOT NULL,
      iss_porcent DECIMAL(5,2) DEFAULT 0.00,
      iss_value DECIMAL(12,2) DEFAULT 0.00,
      total_value DECIMAL(12,2) NOT NULL,
      verification_code VARCHAR(50),
      status VARCHAR(20) DEFAULT 'issued',
      pdf_url VARCHAR(500),
      student_id INTEGER,
      created_at VARCHAR(50) NOT NULL,
      cancelled_at VARCHAR(50)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS nfse_company_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      cnpj VARCHAR(18) NOT NULL DEFAULT '',
      company_name VARCHAR(255) NOT NULL DEFAULT '',
      townhouse VARCHAR(255) NOT NULL DEFAULT '',
      municipal_registry VARCHAR(50) NOT NULL DEFAULT '',
      city VARCHAR(100) NOT NULL DEFAULT '',
      state VARCHAR(2) NOT NULL DEFAULT '',
      iss_porcent DECIMAL(5,2) NOT NULL DEFAULT 2.00,
      updated_at VARCHAR(50) NOT NULL
    );
  `);

  await pool.query(`
    INSERT INTO nfse_company_config (id, cnpj, company_name, townhouse, municipal_registry, city, state, iss_porcent, updated_at)
    VALUES (1, '', '', '', '', '', '', 2.00, $1)
    ON CONFLICT (id) DO NOTHING
  `, [new Date().toISOString()]);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255),
      role VARCHAR(50) DEFAULT 'admin',
      google_id VARCHAR(255)
    );
  `);

  const { rows } = await pool.query("SELECT id FROM academy_state WHERE id = 1");
  if (rows.length === 0) {
    await seedState();
    console.log(`[DB] Banco populado no Postgres`);
  } else {
    console.log(`[DB] Banco conectado no Postgres`);
  }

  return pool;
}

export async function getAcademyData() {
  const { rows } = await pool.query("SELECT * FROM academy_state WHERE id = 1");
  if (rows.length === 0) return await seedState();

  const row = rows[0];
  const parseJSONB = (val, fallback) => {
    if (!val) return fallback;
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return fallback; }
    }
    return val;
  };

  return {
    students: parseJSONB(row.students, []),
    classes: parseJSONB(row.classes, []),
    presenceHistory: parseJSONB(row.presence_history, []),
    employees: parseJSONB(row.employees, []),
    employeePresence: parseJSONB(row.employee_presence, []),
    liveSessions: parseJSONB(row.live_sessions, []),
    pedagogyNotes: parseJSONB(row.pedagogy_notes, []),
    updatedAt: row.updated_at,
  };
}

export async function setAcademyData(data) {
  const current = await getAcademyData();
  const updated = {
    students: data.students ?? current.students,
    classes: data.classes ?? current.classes,
    presenceHistory: data.presenceHistory ?? current.presenceHistory,
    employees: data.employees ?? current.employees,
    employeePresence: data.employeePresence ?? current.employeePresence,
    liveSessions: data.liveSessions ?? current.liveSessions,
    pedagogyNotes: data.pedagogyNotes ?? current.pedagogyNotes,
  };
  const now = new Date().toISOString();

  await pool.query(
    `UPDATE academy_state SET
      students = $1,
      classes = $2,
      presence_history = $3,
      employees = $4,
      employee_presence = $5,
      live_sessions = $6,
      pedagogy_notes = $7,
      updated_at = $8
     WHERE id = 1`,
    [
      JSON.stringify(updated.students),
      JSON.stringify(updated.classes),
      JSON.stringify(updated.presenceHistory),
      JSON.stringify(updated.employees),
      JSON.stringify(updated.employeePresence),
      JSON.stringify(updated.liveSessions),
      JSON.stringify(updated.pedagogyNotes),
      now,
    ]
  );

  const newPayload = { ...updated, updatedAt: now };
  notifyLiveListeners(newPayload);
  return newPayload;
}

export function subscribeLive(listener) {
  liveListeners.add(listener);
  return () => liveListeners.delete(listener);
}

function notifyLiveListeners(data) {
  const payload = {
    students: data.students,
    classes: data.classes,
    presenceHistory: data.presenceHistory,
    liveSessions: data.liveSessions,
    pedagogyNotes: data.pedagogyNotes,
    updatedAt: data.updatedAt,
  };
  for (const fn of liveListeners) {
    try {
      fn(payload);
    } catch (e) {
      console.error("[live] listener error", e);
    }
  }
}

export async function findUserByEmail(email) {
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return rows[0] || null;
}

export async function upsertUser({ email, name, role = "admin", googleId = null }) {
  const existing = await findUserByEmail(email);
  if (existing) return existing;

  const { rows } = await pool.query(
    `INSERT INTO users (email, name, role, google_id) VALUES ($1, $2, $3, $4) RETURNING *`,
    [email, name, role, googleId]
  );

  return rows[0];
}

export async function findUserById(id) {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0] || null;
}
