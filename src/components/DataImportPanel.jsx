import { useState } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { importAlunosCsv } from '../services/api';
import { parseAlunosCsv, mergeImportedRows } from '../utils/natacaoImport';

export default function DataImportPanel({
  setStudents,
  setClasses,
  students,
  classes,
  apiConnected,
  demoMode,
}) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [replace, setReplace] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setStats(null);
    setLoading(true);

    try {
      const csv = await file.text();

      if (apiConnected && !demoMode) {
        const result = await importAlunosCsv(csv, replace);
        setStudents(result.students);
        setClasses(result.classes);
        setStats(result.stats);
      } else {
        const merged = mergeImportedRows(parseAlunosCsv(csv), {
          students,
          classes,
          replace,
        });
        setStudents(merged.students);
        setClasses(merged.classes);
        setStats(merged.stats);
      }
    } catch (err) {
      setError(err.message || 'Falha na importação');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div style={styles.box} className="glass-panel">
      <h3 style={styles.title}>
        <FileSpreadsheet size={20} color="#00f5d4" style={{ marginRight: 8 }} />
        Importar pasta NATAÇÃO (CSV)
      </h3>
      <p style={styles.desc}>
        Envie <code>alunos_importados.csv</code> (colunas: arquivo, nome, cpf, pasta).
        {demoMode && ' No Netlify os dados ficam salvos no navegador (localStorage).'}
      </p>

      <label style={styles.replace}>
        <input
          type="checkbox"
          checked={replace}
          onChange={(ev) => setReplace(ev.target.checked)}
        />
        Substituir alunos e turmas existentes (cuidado)
      </label>

      <label style={styles.uploadBtn}>
        <Upload size={18} style={{ marginRight: 8 }} />
        {loading ? 'Importando…' : 'Selecionar CSV'}
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFile}
          disabled={loading}
          style={{ display: 'none' }}
        />
      </label>

      {error && <p style={styles.err}>{error}</p>}

      {stats && (
        <div style={styles.stats}>
          <p>Linhas: {stats.rowsTotal}</p>
          <p>Alunos criados: {stats.studentsCreated} · atualizados: {stats.studentsUpdated}</p>
          <p>Turmas criadas: {stats.classesCreated}</p>
          {stats.errors?.length > 0 && (
            <p style={styles.err}>Avisos: {stats.errors.length} linha(s) ignorada(s)</p>
          )}
        </div>
      )}

      <p style={styles.cli}>
        Login demo Netlify: <code>admin@h2ocontrol.com</code> / <code>admin</code>
      </p>
    </div>
  );
}

const styles = {
  box: { padding: '1.25rem', marginTop: '1rem' },
  title: { display: 'flex', alignItems: 'center', color: '#f8fafc', marginBottom: '0.5rem' },
  desc: { color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 },
  replace: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#cbd5e1',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  },
  uploadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.65rem 1.25rem',
    background: 'linear-gradient(135deg, #00f5d4, #00bbf9)',
    color: '#080d1a',
    borderRadius: '10px',
    fontWeight: 600,
    cursor: 'pointer',
    width: 'fit-content',
  },
  err: { color: '#f87171', marginTop: '0.75rem' },
  stats: { marginTop: '1rem', color: '#e2e8f0', fontSize: '0.9rem' },
  cli: { marginTop: '1rem', fontSize: '0.8rem', color: '#64748b' },
};
