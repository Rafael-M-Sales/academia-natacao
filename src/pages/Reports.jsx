import React, { useState } from 'react';
import { downloadReport } from '../services/api';

const Reports = () => {
  const [loading, setLoading] = useState(false);

  const downloadFile = async (format) => {
    setLoading(true);
    try {
      const blob = await downloadReport(format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = format === 'csv' ? 'relatorio.csv' : 'relatorio.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Erro ao gerar relatório. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6">
      <h2 className="text-2xl font-bold mb-4">Relatórios Administrativos</h2>
      <p className="mb-6 text-sm text-gray-300">
        Exportar frequência, pagamentos e inadimplência (dados atuais da API).
      </p>
      <div className="flex gap-4">
        <button
          className="btn-primary"
          onClick={() => downloadFile('pdf')}
          disabled={loading}
        >
          {loading ? 'Gerando PDF…' : 'Exportar PDF'}
        </button>
        <button
          className="btn-secondary"
          onClick={() => downloadFile('csv')}
          disabled={loading}
        >
          {loading ? 'Gerando CSV…' : 'Exportar CSV'}
        </button>
      </div>
    </div>
  );
};

export default Reports;
