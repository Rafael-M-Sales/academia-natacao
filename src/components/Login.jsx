import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(
        err.message === 'Credenciais inválidas'
          ? 'Credenciais inválidas. Use admin@h2ocontrol.com / admin'
          : 'Inicie a API: npm run server (porta 5000) e depois npm run dev'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="glass-panel login-card">
        <h2 className="page-title" style={{ marginBottom: '0.25rem' }}>
          H2O Control
        </h2>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Coordenação / administrador
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="admin@h2ocontrol.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="custom-input"
            required
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="custom-input"
            required
            style={{ marginTop: '0.5rem' }}
            autoComplete="current-password"
          />
          {error && (
            <p style={{ color: '#ff3366', marginTop: '0.75rem', fontSize: '0.85rem' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            className="btn-primary"
            style={{ marginTop: '1rem', width: '100%' }}
            disabled={submitting}
          >
            {submitting ? 'Entrando…' : 'Entrar no painel'}
          </button>
        </form>
        <a href="#professor" className="btn-secondary login-professor-link">
          Acesso professor (celular + voz)
        </a>
        <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '1rem' }}>
          Admin: admin@h2ocontrol.com / admin · Professor: PIN 1234
        </p>
      </div>
    </div>
  );
}
