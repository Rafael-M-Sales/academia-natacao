import express from "express";
import Stripe from "stripe";
import { generateBoletoPDF } from "../utils/pdfGenerator.js";
import { STRIPE_SECRET_KEY } from "../config.js";

const router = express.Router();
const stripeKey = STRIPE_SECRET_KEY;
const stripe =
  stripeKey && !stripeKey.includes("placeholder")
    ? new Stripe(stripeKey)
    : null;

// Mock endpoint for PIX QR generation (static QR for demo)
router.post("/pix", (req, res) => {
  const { amount, description } = req.body;
  // In a real integration, generate QR via bank API. Here we return dummy data.
  res.json({
    type: "PIX",
    amount,
    description,
    qrCode: "https://dummy-qr-code.com/qr.png",
    expiresIn: 3600,
  });
});

// Stripe card payment (test mode)
router.post("/card", async (req, res) => {
  const { amount, token, description } = req.body;
  if (!stripe) {
    return res.status(503).json({
      success: false,
      error: "Stripe não configurado. Defina STRIPE_SECRET_KEY no .env",
    });
  }
  try {
    const charge = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // amount in cents
      currency: "brl",
      payment_method: token,
      description,
      confirm: true,
    });
    res.json({ success: true, charge });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// Boleto generation (mock PDF)
router.post("/boleto", async (req, res) => {
  const { amount, payerName, payerCpf } = req.body;
  const pdfBuffer = await generateBoletoPDF({ amount, payerName, payerCpf });
  res.set({ "Content-Type": "application/pdf", "Content-Disposition": "attachment; filename=boleto.pdf" });
  res.send(pdfBuffer);
});

export default router;
