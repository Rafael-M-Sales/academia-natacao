import React, { useState } from 'react';
import { postPayment } from '../services/api';

export default function PaymentGateway() {
  const [method, setMethod] = useState('pix');
  const [amount, setAmount] = useState(0);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (method === 'pix') {
        const res = await postPayment('pix', {
          amount,
          description: 'Pagamento academia',
        });
        alert(`PIX gerado (demo): ${res.qrCode}`);
      } else if (method === 'card') {
        const res = await postPayment('card', {
          amount,
          token: 'tok_visa',
          description: 'Pagamento academia',
        });
        alert(res.success ? 'Pagamento aprovado' : `Falha: ${res.error}`);
      } else if (method === 'boleto') {
        const { payerName, payerCpf } = details;
        const blob = await postPayment(
          'boleto',
          { amount, payerName, payerCpf },
          { responseType: 'blob' }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'boleto.pdf';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert(err.message || 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h2 className="page-title">Tipos de Pagamentos</h2>
      <form onSubmit={handleSubmit}>
        <div style={formRow}>
          <div style={fieldHalf}>
            <span style={{ ...fieldLabel, visibility: 'hidden' }}>_</span>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="custom-input"
            >
              <option value="pix">PIX</option>
              <option value="card">Cartão de Débito/Crédito</option>
              <option value="boleto">Boleto Bancário</option>
            </select>
          </div>
          <div style={fieldHalf}>
            <label style={fieldLabel}>Valor (R$)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              required
              min="0"
              step="0.01"
              className="custom-input"
            />
          </div>
        </div>

        {method === 'boleto' && (
          <div style={{ ...formRow, marginTop: '1rem' }}>
            <div style={fieldHalf}>
              <label style={fieldLabel}>Nome do Pagador</label>
              <input
                type="text"
                onChange={(e) =>
                  setDetails({ ...details, payerName: e.target.value })
                }
                required
                className="custom-input"
              />
            </div>
            <div style={fieldHalf}>
              <label style={fieldLabel}>CPF do Pagador</label>
              <input
                type="text"
                onChange={(e) =>
                  setDetails({ ...details, payerCpf: e.target.value })
                }
                required
                className="custom-input"
              />
            </div>
          </div>
        )}

        <div style={btnRow}>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processando…' : 'Pagar'}
          </button>
        </div>
      </form>
    </div>
  );
}

const formRow = {
  display: 'flex',
  gap: '1rem',
};

const fieldHalf = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
};

const fieldLabel = {
  fontSize: '0.8rem',
  fontWeight: '600',
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
};

const btnRow = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '1rem',
};
