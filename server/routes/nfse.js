import express from "express";
import pg from "pg";
import { DATABASE_URL } from "../config.js";

const { Pool } = pg;
const pool = new Pool({ connectionString: DATABASE_URL });

const router = express.Router();

function fmt(val) {
  return (parseFloat(val) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function generateRPS() {
  const now = new Date();
  const y = now.getFullYear();
  const seq = String(Math.floor(Math.random() * 900000) + 100000);
  return `${y}${seq}`;
}

function generateVerificationCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

router.get("/config", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM nfse_company_config WHERE id = 1");
    if (rows.length === 0) {
      return res.json({
        cnpj: "", companyName: "", townhouse: "", municipalRegistry: "",
        city: "", state: "", issPorcent: 2.0,
      });
    }
    const r = rows[0];
    res.json({
      cnpj: r.cnpj, companyName: r.company_name, townhouse: r.townhouse,
      municipalRegistry: r.municipal_registry, city: r.city, state: r.state,
      issPorcent: parseFloat(r.iss_porcent) || 2.0,
    });
  } catch (e) {
    console.error("[NFSe] config error:", e);
    res.status(500).json({ error: e.message });
  }
});

router.put("/config", async (req, res) => {
  try {
    const { cnpj, companyName, townhouse, municipalRegistry, city, state, issPorcent } = req.body;
    const now = new Date().toISOString();
    await pool.query(
      `UPDATE nfse_company_config SET
        cnpj = $1, company_name = $2, townhouse = $3,
        municipal_registry = $4, city = $5, state = $6,
        iss_porcent = $7, updated_at = $8
       WHERE id = 1`,
      [cnpj || "", companyName || "", townhouse || "", municipalRegistry || "",
       city || "", state || "", parseFloat(issPorcent) || 2.0, now]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error("[NFSe] config update error:", e);
    res.status(500).json({ error: e.message });
  }
});

router.get("/list", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM nfse_invoices ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (e) {
    console.error("[NFSe] list error:", e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/issue", async (req, res) => {
  try {
    const { studentId, takerCpfCnpj, takerName, serviceDescription, serviceValue } = req.body;

    const configRows = await pool.query("SELECT * FROM nfse_company_config WHERE id = 1");
    const cfg = configRows.rows[0];
    if (!cfg || !cfg.cnpj) {
      return res.status(400).json({ error: "Configure os dados da empresa (CNPJ) antes de emitir." });
    }

    const number = generateRPS();
    const issP = parseFloat(cfg.iss_porcent) || 2.0;
    const val = parseFloat(serviceValue) || 0;
    const issV = val * (issP / 100);
    const total = val;
    const verificationCode = generateVerificationCode();
    const now = new Date().toISOString();

    const { rows } = await pool.query(
      `INSERT INTO nfse_invoices
        (number, series, issuance_date, provider_cnpj, provider_name, provider_townhouse,
         taker_cpf_cnpj, taker_name, service_description, service_value,
         iss_porcent, iss_value, total_value, verification_code,
         status, student_id, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'issued',$15,$16)
       RETURNING *`,
      [
        number, "1", now,
        cfg.cnpj, cfg.company_name, cfg.townhouse,
        takerCpfCnpj || "", takerName || "",
        serviceDescription || "", val,
        issP, issV, total, verificationCode,
        studentId || null, now,
      ]
    );

    res.json(rows[0]);
  } catch (e) {
    console.error("[NFSe] issue error:", e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/:id/cancel", async (req, res) => {
  try {
    const now = new Date().toISOString();
    await pool.query(
      "UPDATE nfse_invoices SET status = 'cancelled', cancelled_at = $1 WHERE id = $2",
      [now, req.params.id]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error("[NFSe] cancel error:", e);
    res.status(500).json({ error: e.message });
  }
});

router.get("/:id/pdf", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM nfse_invoices WHERE id = $1", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Nota não encontrada" });

    const inv = rows[0];
    const d = new Date(inv.issuance_date);
    const dateStr = d.toLocaleDateString("pt-BR");
    const hourStr = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const pdf = `NF-SE DIGITAL
H2O Control Swim Academy

============================================
NOTA FISCAL DE SERVICOS ELETRONICA - NFS-e
============================================

NUMERO: ${inv.number}
SERIE: ${inv.series}
DATA EMISSAO: ${dateStr} ${hourStr}
CODIGO VERIFICACAO: ${inv.verification_code}
STATUS: ${inv.status === "cancelled" ? "CANCELADA" : "AUTORIZADA"}

PRESTADOR:
  CNPJ: ${inv.provider_cnpj}
  NOME: ${inv.provider_name}
  ENDERECO: ${inv.provider_townhouse || "---"}

TOMADOR:
  CPF/CNPJ: ${inv.taker_cpf_cnpj}
  NOME: ${inv.taker_name}

SERVICO:
  DESCRICAO: ${inv.service_description}

VALORES:
  Valor Servico: R$ ${fmt(inv.service_value)}
  ISS (${parseFloat(inv.iss_porcent).toFixed(2)}%): R$ ${fmt(inv.iss_value)}
  TOTAL LIQUIDO: R$ ${fmt(inv.total_value)}

============================================
  Documento gerado em ${dateStr} ${hourStr}
  Consulte pelo codigo: ${inv.verification_code}
============================================
`;

    res.set({
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="nfse-${inv.number}.txt"`,
    });
    res.send(pdf);
  } catch (e) {
    console.error("[NFSe] pdf error:", e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
