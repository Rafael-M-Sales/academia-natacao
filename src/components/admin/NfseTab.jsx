import { useState, useEffect } from 'react';
import { FileText, Receipt, Settings, Plus, Download, XCircle, Search, Building2 } from 'lucide-react';
import { API_URL } from '../../config';

const API = API_URL ? `${API_URL}/api/nfse` : '/api/nfse';

export default function NfseTab({ students }) {
  const [tab, setTab] = useState('invoices');
  const [invoices, setInvoices] = useState([]);
  const [config, setConfig] = useState(null);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [form, setForm] = useState({ studentId: '', takerCpfCnpj: '', takerName: '', serviceDescription: '', serviceValue: '' });
  const [configForm, setConfigForm] = useState({ cnpj: '', companyName: '', townhouse: '', municipalRegistry: '', city: '', state: '', issPorcent: 2.0 });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadInvoices(); loadConfig(); }, []);

  async function loadInvoices() {
    try {
      const r = await fetch(`${API}/list`);
      if (r.ok) setInvoices(await r.json());
    } catch {}
  }

  async function loadConfig() {
    try {
      const r = await fetch(`${API}/config`);
      if (r.ok) {
        const data = await r.json();
        setConfig(data);
        setConfigForm(data);
      }
    } catch {}
  }

  async function handleSaveConfig(e) {
    e.preventDefault();
    try {
      const r = await fetch(`${API}/config`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(configForm) });
      if (r.ok) {
        setMsg('Dados da empresa salvos com sucesso!');
        loadConfig();
      } else {
        setMsg('Erro ao salvar configuração.');
      }
    } catch { setMsg('Erro de conexão com o servidor.'); }
    setTimeout(() => setMsg(''), 4000);
  }

  function handleSelectStudent(studentId) {
    const s = students.find(st => st.id === parseInt(studentId));
    if (s) {
      setForm(prev => ({
        ...prev,
        studentId,
        takerName: s.name,
        takerCpfCnpj: s.cpf || '',
        serviceValue: s.monthlyFee ? s.monthlyFee.toFixed(2) : '250.00',
      }));
    }
  }

  async function handleIssue(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch(`${API}/issue`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, serviceValue: parseFloat(form.serviceValue) }) });
      if (r.ok) {
        setMsg('Nota fiscal emitida com sucesso!');
        setShowIssueForm(false);
        setForm({ studentId: '', takerCpfCnpj: '', takerName: '', serviceDescription: '', serviceValue: '' });
        loadInvoices();
      } else {
        const err = await r.json();
        setMsg(err.error || 'Erro ao emitir nota.');
      }
    } catch { setMsg('Erro de conexão.'); }
    setLoading(false);
    setTimeout(() => setMsg(''), 4000);
  }

  async function handleCancel(invoiceId) {
    if (!window.confirm('Tem certeza que deseja cancelar esta nota fiscal?')) return;
    try {
      const r = await fetch(`${API}/${invoiceId}/cancel`, { method: 'POST' });
      if (r.ok) {
        setMsg('Nota fiscal cancelada.');
        loadInvoices();
      }
    } catch {}
    setTimeout(() => setMsg(''), 4000);
  }

  function fmtBR(val) {
    return (parseFloat(val) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function fmtDate(dateStr) {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  const navItems = [
    { id: 'invoices', label: 'Notas Emitidas', icon: Receipt },
    { id: 'config', label: 'Emissão de NF', icon: Building2 },
  ];

  return (
    <div style={container}>
      {msg && <div style={toast}>{msg}</div>}

      <div style={headerRow}>
        <div>
          <h3 style={title}><FileText size={22} style={{ marginRight: '8px' }} /> Nota Fiscal Eletrônica (NFS-e)</h3>
          <p style={subtitle}>Emissão de notas fiscais de serviços — Sistema e-Nota</p>
        </div>
        {tab === 'invoices' && config?.cnpj && (
          <button className="btn-cyan" onClick={() => setShowIssueForm(true)} style={{ padding: '0.6rem 1.25rem' }}>
            <Plus size={18} style={{ marginRight: '6px' }} />
            Nova Nota
          </button>
        )}
      </div>

      <div style={nav} className="glass-panel">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{ ...navBtn, ...(tab === id ? navBtnActive : {}) }}>
            <Icon size={16} style={{ marginRight: '6px' }} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'invoices' && (
        <>
          {!config?.cnpj ? (
            <div className="glass-panel" style={emptyCfg}>
              <Building2 size={40} color="#64748b" />
              <p>Configure os dados da empresa na aba <strong>"Emissão de NF"</strong> antes de emitir notas fiscais.</p>
            </div>
          ) : showIssueForm ? (
            <div className="glass-panel" style={formPanel}>
              <h4 style={formTitle}>Emitir Nova Nota Fiscal</h4>
              <form onSubmit={handleIssue} style={formGrid}>
                <div style={formGroup}>
                  <label style={label}>Aluno (opcional)</label>
                  <select className="custom-select" value={form.studentId} onChange={(e) => handleSelectStudent(e.target.value)}>
                    <option value="" style={{ background: '#0e172c', color: '#94a3b8' }}>Selecione um aluno...</option>
                    {students.filter(s => s.status === 'Ativo').map(s => (
                      <option key={s.id} value={s.id} style={{ background: '#0e172c', color: '#fff' }}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div style={formGroup}>
                  <label style={label}>Nome do Tomador *</label>
                  <input className="custom-input" required value={form.takerName} onChange={(e) => setForm(p => ({ ...p, takerName: e.target.value }))} />
                </div>
                <div style={formGroup}>
                  <label style={label}>CPF/CNPJ do Tomador *</label>
                  <input className="custom-input" required placeholder="000.000.000-00" value={form.takerCpfCnpj} onChange={(e) => setForm(p => ({ ...p, takerCpfCnpj: e.target.value }))} />
                </div>
                <div style={formGroup}>
                  <label style={label}>Descrição do Serviço *</label>
                  <textarea className="custom-input" required style={{ minHeight: '60px' }} placeholder="Ex: Mensalidade de natação - maio/2026" value={form.serviceDescription} onChange={(e) => setForm(p => ({ ...p, serviceDescription: e.target.value }))} />
                </div>
                <div style={formGroup}>
                  <label style={label}>Valor do Serviço (R$) *</label>
                  <input className="custom-input" type="number" step="0.01" min="0" required value={form.serviceValue} onChange={(e) => setForm(p => ({ ...p, serviceValue: e.target.value }))} />
                </div>
                <div style={formActions}>
                  <button type="submit" className="btn-cyan" disabled={loading} style={{ padding: '0.65rem 1.5rem' }}>
                    {loading ? 'Emitindo...' : 'Emitir Nota'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setShowIssueForm(false)} style={{ padding: '0.65rem 1.5rem' }}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          ) : invoices.length === 0 ? (
            <div className="glass-panel" style={emptyCfg}>
              <Receipt size={40} color="#64748b" />
              <p>Nenhuma nota fiscal emitida ainda.</p>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={tableWrap}>
                <table style={table}>
                  <thead>
                    <tr>
                      <th style={th}>Número</th>
                      <th style={th}>Tomador</th>
                      <th style={th}>Serviço</th>
                      <th style={th}>Valor</th>
                      <th style={th}>Emissão</th>
                      <th style={th}>Status</th>
                      <th style={th}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id} style={tr}>
                        <td style={td}><span style={numBadge}>{inv.number}</span></td>
                        <td style={td}>
                          <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.82rem' }}>{inv.taker_name}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{inv.taker_cpf_cnpj}</div>
                        </td>
                        <td style={{ ...td, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.service_description}</td>
                        <td style={td}>R$ {fmtBR(inv.total_value)}</td>
                        <td style={{ ...td, fontSize: '0.75rem' }}>{fmtDate(inv.issuance_date)}</td>
                        <td style={td}>
                          <span style={{ ...statusBadge, color: inv.status === 'cancelled' ? '#ff3366' : '#00f5d4', borderColor: inv.status === 'cancelled' ? 'rgba(255,51,102,0.2)' : 'rgba(0,245,212,0.2)', background: inv.status === 'cancelled' ? 'rgba(255,51,102,0.05)' : 'rgba(0,245,212,0.05)' }}>
                            {inv.status === 'cancelled' ? 'Cancelada' : 'Autorizada'}
                          </span>
                        </td>
                        <td style={td}>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <a href={`${API}/${inv.id}/pdf`} target="_blank" rel="noopener noreferrer" style={actionBtn} title="Download NFS-e">
                              <Download size={14} />
                            </a>
                            {inv.status !== 'cancelled' && (
                              <button style={{ ...actionBtn, color: '#ff3366' }} onClick={() => handleCancel(inv.id)} title="Cancelar">
                                <XCircle size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'config' && (
        <div className="glass-panel" style={formPanel}>
          <h4 style={formTitle}>Dados da Empresa (Prestador)</h4>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>
            Estes dados serão usados na emissão das notas fiscais.
          </p>
          <form onSubmit={handleSaveConfig} style={formGrid}>
            <div style={formGroup}>
              <label style={label}>CNPJ *</label>
              <input className="custom-input" required placeholder="00.000.000/0000-00" value={configForm.cnpj} onChange={(e) => setConfigForm(p => ({ ...p, cnpj: e.target.value }))} />
            </div>
            <div style={formGroup}>
              <label style={label}>Razão Social *</label>
              <input className="custom-input" required placeholder="Nome da academia" value={configForm.companyName} onChange={(e) => setConfigForm(p => ({ ...p, companyName: e.target.value }))} />
            </div>
            <div style={formGroup}>
              <label style={label}>Endereço</label>
              <input className="custom-input" placeholder="Rua, número, bairro" value={configForm.townhouse} onChange={(e) => setConfigForm(p => ({ ...p, townhouse: e.target.value }))} />
            </div>
            <div style={formGroupRow}>
              <div style={{ flex: 1 }}>
                <label style={label}>Cidade</label>
                <input className="custom-input" value={configForm.city} onChange={(e) => setConfigForm(p => ({ ...p, city: e.target.value }))} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={label}>UF</label>
                <input className="custom-input" maxLength={2} placeholder="SP" value={configForm.state} onChange={(e) => setConfigForm(p => ({ ...p, state: e.target.value }))} />
              </div>
            </div>
            <div style={formGroupRow}>
              <div style={{ flex: 1 }}>
                <label style={label}>Inscrição Municipal</label>
                <input className="custom-input" value={configForm.municipalRegistry} onChange={(e) => setConfigForm(p => ({ ...p, municipalRegistry: e.target.value }))} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={label}>% ISS</label>
                <input className="custom-input" type="number" step="0.01" min="0" max="10" value={configForm.issPorcent} onChange={(e) => setConfigForm(p => ({ ...p, issPorcent: parseFloat(e.target.value) || 0 }))} />
              </div>
            </div>
            <button type="submit" className="btn-cyan" style={{ alignSelf: 'flex-start', padding: '0.65rem 1.5rem' }}>
              Salvar Dados
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const container = { display: 'flex', flexDirection: 'column', gap: '1.5rem' };
const toast = { position: 'fixed', top: '20px', right: '20px', zIndex: 9999, padding: '0.85rem 1.25rem', borderRadius: '10px', background: '#0e172c', border: '1px solid rgba(0, 245, 212, 0.2)', color: '#00f5d4', fontSize: '0.85rem', fontWeight: '600', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' };
const headerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' };
const title = { fontFamily: 'var(--font-title)', fontSize: '1.3rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center' };
const subtitle = { fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' };
const nav = { display: 'flex', gap: '0.4rem', padding: '0.4rem', borderRadius: '12px' };
const navBtn = { display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', transition: 'all 0.2s' };
const navBtnActive = { background: 'rgba(255,255,255,0.05)', color: '#00bbf9' };
const emptyCfg = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' };
const formPanel = { padding: '2rem' };
const formTitle = { fontFamily: 'var(--font-title)', fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '1.25rem' };
const formGrid = { display: 'flex', flexDirection: 'column', gap: '1.25rem' };
const formGroup = { display: 'flex', flexDirection: 'column', gap: '0.35rem' };
const formGroupRow = { display: 'flex', gap: '1rem' };
const label = { fontSize: '0.78rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.03em' };
const formActions = { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' };
const tableWrap = { width: '100%', overflowX: 'auto' };
const table = { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' };
const th = { textAlign: 'left', padding: '0.75rem 1rem', color: '#64748b', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid rgba(255,255,255,0.04)' };
const td = { padding: '0.75rem 1rem', color: '#e2e8f0', verticalAlign: 'middle', borderBottom: '1px solid rgba(255,255,255,0.02)' };
const tr = { transition: 'background 0.15s' };
const numBadge = { fontFamily: 'monospace', background: 'rgba(0,187,249,0.08)', border: '1px solid rgba(0,187,249,0.15)', borderRadius: '6px', padding: '0.15rem 0.5rem', fontSize: '0.78rem', fontWeight: '700', color: '#00bbf9' };
const statusBadge = { padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', border: '1px solid' };
const actionBtn = { display: 'inline-flex', padding: '0.3rem', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: '#00bbf9', cursor: 'pointer', transition: 'all 0.15s', textDecoration: 'none' };
