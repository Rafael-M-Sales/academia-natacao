import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import paymentsRouter from "./routes/payments.js";
import reportsRouter from "./routes/reports.js";
import academyRouter from "./routes/academy.js";
import liveRouter from "./routes/live.js";
import importRouter from "./routes/import.js";
import nfseRouter from "./routes/nfse.js";
import { initDatabase } from "./db/database.js";
import { PORT } from "./config.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, database: "postgres" });
});

app.use("/api/auth", authRouter);
app.use("/api/academy", academyRouter);
app.use("/api/live", liveRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/import", importRouter);
app.use("/api/nfse", nfseRouter);

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Failed to initialize database:", err);
});
