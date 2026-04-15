import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { dealsAPI, contactsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const stages = ['Prospect', 'Negotiation', 'Closed Won', 'Closed Lost'];
const stageColors = {
  'Prospect': { border: 'var(--tertiary)', text: 'var(--tertiary)' },
  'Negotiation': { border: 'var(--secondary)', text: 'var(--secondary)' },
  'Closed Won': { border: '#2ecc40', text: '#1a7a1a' },
  'Closed Lost': { border: 'var(--text-muted)', text: 'var(--text-muted)' },
};

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

function DealModal({ deal, contacts, onClose, onSave }) {
  const [form, setForm] = useState(() => {
    if (deal) {
      const contactVal = deal.contactId && typeof deal.contactId === 'object' ? deal.contactId._id : deal.contactId;
      return { ...deal, contactId: contactVal || '' };
    }
    return { title: '', value: '', stage: 'Prospect', probability: 20, contactId: '', notes: '' };
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.value) { toast.error('Title and value required'); return; }
    setLoading(true);
    try {
      await onSave({ ...form, value: Number(form.value), probability: Number(form.probability) });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px' }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
        style={{ background: 'var(--surface-container-lowest)', width: '100%', maxWidth: '520px', padding: '32px' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '4px solid var(--on-surface)', paddingBottom: '12px' }}>
          <h3 className="headline-sm" style={{ textTransform: 'uppercase' }}>{deal ? 'Edit Deal' : 'New Deal'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><span className="material-symbols-outlined">close</span></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            { key: 'title', label: 'Deal Title', type: 'text' },
            { key: 'value', label: 'Value ($)', type: 'number' },
            { key: 'probability', label: 'Probability (%)', type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label className="label-sm" style={{ display: 'block', marginBottom: '8px', color: 'var(--on-surface-variant)' }}>{f.label}</label>
              <input className="input-bauhaus" type={f.type} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required={f.key !== 'probability'} min={f.key === 'probability' ? 0 : undefined} max={f.key === 'probability' ? 100 : undefined} />
            </div>
          ))}
          <div>
            <label className="label-sm" style={{ display: 'block', marginBottom: '8px', color: 'var(--on-surface-variant)' }}>STAGE</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {stages.map(s => (
                <button key={s} type="button" onClick={() => setForm(p => ({ ...p, stage: s }))}
                  style={{ padding: '8px 12px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-headline)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, background: form.stage === s ? stageColors[s].border : 'var(--surface-container)', color: form.stage === s ? 'white' : 'var(--on-surface)', transition: 'all 0.2s' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          {contacts.length > 0 && (
            <div>
              <label className="label-sm" style={{ display: 'block', marginBottom: '8px', color: 'var(--on-surface-variant)' }}>LINKED CONTACT (OPTIONAL)</label>
              <select className="input-bauhaus" value={form.contactId || ''} onChange={e => setForm(p => ({ ...p, contactId: e.target.value }))} style={{ cursor: 'pointer' }}>
                <option value="">None</option>
                {contacts.map(c => <option key={c._id} value={c._id}>{c.name} — {c.company}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label-sm" style={{ display: 'block', marginBottom: '8px', color: 'var(--on-surface-variant)' }}>NOTES</label>
            <textarea className="input-bauhaus" value={form.notes || ''} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? 'Saving...' : deal ? 'Update Deal' : 'Create Deal'}
            </button>
            <button type="button" onClick={onClose} className="btn" style={{ background: 'var(--surface-container)', color: 'var(--on-surface)' }}>Cancel</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function Pipeline() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const canEdit = ['admin', 'manager'].includes(user?.role);

  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [draggedDeal, setDraggedDeal] = useState(null);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const [dealsRes, contactsRes] = await Promise.all([dealsAPI.getAll(), contactsAPI.getAll()]);
      setDeals(dealsRes.data.data);
      setContacts(contactsRes.data.data);
    } catch (err) {
      toast.error('Failed to load pipeline');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  const handleSave = async (formData) => {
    if (editingDeal) {
      const { data } = await dealsAPI.update(editingDeal._id, formData);
      setDeals(prev => prev.map(d => d._id === editingDeal._id ? data.data : d));
      toast.success('Deal updated');
    } else {
      const { data } = await dealsAPI.create(formData);
      setDeals(prev => [data.data, ...prev]);
      toast.success('Deal created');
    }
    setEditingDeal(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this deal?')) return;
    await dealsAPI.delete(id);
    setDeals(prev => prev.filter(d => d._id !== id));
    toast.success('Deal deleted');
  };

  const handleDrop = async (stage) => {
    if (!draggedDeal || draggedDeal.stage === stage) return;
    const updated = { ...draggedDeal, stage };
    setDeals(prev => prev.map(d => d._id === draggedDeal._id ? updated : d));
    try {
      await dealsAPI.update(draggedDeal._id, { stage });
      toast.success(`Moved to ${stage}`);
    } catch {
      setDeals(prev => prev.map(d => d._id === draggedDeal._id ? draggedDeal : d));
      toast.error('Failed to update stage');
    }
    setDraggedDeal(null);
  };

  const getContactName = (deal) => deal.contactId?.name || '';
  const getStageTotal = (stage) => deals.filter(d => d.stage === stage).reduce((s, d) => s + d.value, 0);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', borderBottom: '4px solid var(--on-surface)', paddingBottom: '12px' }}>
        <div>
          <p className="label-sm" style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>DEAL FLOW</p>
          <h2 className="headline-md" style={{ textTransform: 'uppercase' }}>Pipeline</h2>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {!loading && <span className="label-sm" style={{ color: 'var(--text-muted)' }}>{deals.length} DEALS • ${(deals.reduce((s, d) => s + d.value, 0) / 1000).toFixed(0)}K TOTAL</span>}
          {canEdit && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} className="btn btn-primary" onClick={() => { setEditingDeal(null); setShowModal(true); }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>NEW DEAL
            </motion.button>
          )}
        </div>
      </motion.div>

      {loading ? (
        <div style={{ display: 'flex', gap: '16px' }}>
          {stages.map(s => <div key={s} className="skeleton" style={{ flex: 1, height: '400px', minWidth: '240px' }} />)}
        </div>
      ) : (
        <motion.div variants={itemVariants} className="kanban-board" style={{ alignItems: 'flex-start' }}>
          {stages.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage);
            const colors = stageColors[stage];
            return (
              <div key={stage} className="kanban-column" onDragOver={e => e.preventDefault()} onDrop={canEdit ? () => handleDrop(stage) : undefined} style={{ flex: 1, minWidth: '260px' }}>
                <div className="kanban-column-header" style={{ borderLeft: `4px solid ${colors.border}`, background: 'var(--surface-container-lowest)' }}>
                  <span style={{ color: colors.text }}>{stage}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="label-xs" style={{ color: 'var(--text-muted)' }}>{stageDeals.length}</span>
                    <span className="label-xs" style={{ color: colors.text, background: `${colors.border}20`, padding: '2px 8px' }}>${(getStageTotal(stage) / 1000).toFixed(0)}K</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {stageDeals.map(deal => (
                    <motion.div key={deal._id} layout draggable={canEdit} onDragStart={canEdit ? () => setDraggedDeal(deal) : undefined} className="kanban-card" style={{ borderLeft: `4px solid ${colors.border}` }} whileHover={{ y: -2, boxShadow: 'var(--shadow-ambient)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <h4 className="title-sm" style={{ flex: 1, paddingRight: '8px' }}>{deal.title}</h4>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {canEdit && (
                            <button onClick={() => { setEditingDeal(deal); setShowModal(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                            </button>
                          )}
                          {isAdmin && (
                            <button onClick={() => handleDelete(deal._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-headline)', color: colors.text }}>${(deal.value / 1000).toFixed(0)}K</span>
                        <span className="label-xs" style={{ color: 'var(--text-muted)', alignSelf: 'flex-end' }}>{deal.probability}%</span>
                      </div>
                      <div style={{ height: '3px', background: 'var(--surface-container)', marginBottom: '12px' }}>
                        <div style={{ height: '100%', width: `${deal.probability}%`, background: colors.border, transition: 'width 0.3s ease' }} />
                      </div>
                      {getContactName(deal) && (
                        <p className="label-xs" style={{ color: 'var(--on-surface-variant)' }}>{getContactName(deal)}</p>
                      )}
                    </motion.div>
                  ))}
                  {stageDeals.length === 0 && (
                    <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface-container-low)', border: '2px dashed var(--surface-container-high)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>drag_indicator</span>
                      <p className="label-xs">Drop deals here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      <AnimatePresence>
        {showModal && <DealModal deal={editingDeal} contacts={contacts} onClose={() => { setShowModal(false); setEditingDeal(null); }} onSave={handleSave} />}
      </AnimatePresence>
    </motion.div>
  );
}
