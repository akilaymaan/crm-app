import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { contactsAPI } from '../services/api';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

function ContactModal({ contact, onClose, onSave }) {
  const [form, setForm] = useState(contact || { name: '', email: '', phone: '', company: '', status: 'Lead', valuation: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave({ ...form, valuation: Number(form.valuation) || 0 });
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
          <h3 className="headline-sm" style={{ textTransform: 'uppercase' }}>{contact ? 'Edit Contact' : 'New Contact'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><span className="material-symbols-outlined">close</span></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            { key: 'name', label: 'Full Name', type: 'text', required: true },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'phone', label: 'Phone', type: 'tel' },
            { key: 'company', label: 'Company', type: 'text' },
            { key: 'valuation', label: 'Valuation ($)', type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label className="label-sm" style={{ display: 'block', marginBottom: '8px', color: 'var(--on-surface-variant)' }}>{f.label}</label>
              <input className="input-bauhaus" type={f.type} value={form[f.key] || ''} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={`Enter ${f.label.toLowerCase()}`} required={f.required} />
              {errors[f.key] && <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{errors[f.key]}</span>}
            </div>
          ))}
          <div>
            <label className="label-sm" style={{ display: 'block', marginBottom: '8px', color: 'var(--on-surface-variant)' }}>STATUS</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Lead', 'Prospect', 'Active', 'Inactive'].map(s => (
                <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
                  style={{ padding: '8px 16px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-headline)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, background: form.status === s ? 'var(--secondary)' : 'var(--surface-container)', color: form.status === s ? 'white' : 'var(--on-surface)', transition: 'all 0.2s' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label-sm" style={{ display: 'block', marginBottom: '8px', color: 'var(--on-surface-variant)' }}>NOTES</label>
            <textarea className="input-bauhaus" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Add notes..." style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', opacity: loading ? 0.8 : 1 }}>
              {loading ? <><div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />&nbsp;Saving...</> : (contact ? 'Update' : 'Create')}
            </button>
            <button type="button" onClick={onClose} className="btn" style={{ background: 'var(--surface-container)', color: 'var(--on-surface)' }}>Cancel</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function ContactDetail({ contact, onClose, onEdit, onDelete }) {
  const [delLoading, setDelLoading] = useState(false);
  const handleDelete = async () => {
    if (!confirm(`Delete ${contact.name}?`)) return;
    setDelLoading(true);
    try {
      await onDelete(contact._id);
      onClose();
    } finally {
      setDelLoading(false);
    }
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px' }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
        style={{ background: 'var(--surface-container-lowest)', width: '100%', maxWidth: '600px' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ background: 'var(--secondary)', padding: '32px', color: 'white', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '1.5rem' }}>
            {contact.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="headline-md" style={{ color: 'white', marginBottom: '4px' }}>{contact.name}</h3>
            <p style={{ opacity: 0.8, fontSize: '0.875rem' }}>{contact.company || 'No company'}</p>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}><span className="material-symbols-outlined">close</span></button>
        </div>
        <div style={{ padding: '24px' }}>
          <div className="modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            {[
              { label: 'Email', value: contact.email || '—', icon: 'email' },
              { label: 'Phone', value: contact.phone || '—', icon: 'phone' },
              { label: 'Status', value: contact.status, icon: 'info' },
              { label: 'Valuation', value: contact.valuation ? `$${contact.valuation.toLocaleString()}` : '—', icon: 'attach_money' },
            ].map(item => (
              <div key={item.label}>
                <p className="label-xs" style={{ color: 'var(--text-muted)', marginBottom: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '14px', marginRight: '4px' }}>{item.icon}</span>{item.label}</p>
                <p className="body-md" style={{ fontWeight: 500 }}>{item.value}</p>
              </div>
            ))}
          </div>
          {contact.notes && (
            <div style={{ marginBottom: '24px' }}>
              <p className="label-xs" style={{ color: 'var(--text-muted)', marginBottom: '8px' }}><span className="material-symbols-outlined" style={{ fontSize: '14px', marginRight: '4px' }}>notes</span>NOTES</p>
              <p className="body-md" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.7 }}>{contact.notes}</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => { onClose(); onEdit(contact); }} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>Edit
            </button>
            <button onClick={handleDelete} disabled={delLoading} className="btn" style={{ background: 'var(--error)', color: 'white' }}>
              {delLoading ? '...' : <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Contacts({ searchQuery = '' }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'All') params.status = statusFilter;
      const { data } = await contactsAPI.getAll(params);
      setContacts(data.data);
    } catch (err) {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleSave = async (formData) => {
    if (editingContact) {
      const { data } = await contactsAPI.update(editingContact._id, formData);
      setContacts(prev => prev.map(c => c._id === editingContact._id ? data.data : c));
      toast.success('Contact updated');
    } else {
      const { data } = await contactsAPI.create(formData);
      setContacts(prev => [data.data, ...prev]);
      toast.success('Contact created');
    }
    setEditingContact(null);
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    await contactsAPI.delete(id);
    setContacts(prev => prev.filter(c => c._id !== id));
    toast.success('Contact deleted');
  };

  const handleEdit = (contact) => {
    setSelectedContact(null);
    setEditingContact(contact);
    setShowModal(true);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', borderBottom: '4px solid var(--on-surface)', paddingBottom: '12px' }}>
        <div>
          <p className="label-sm" style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>CRM DATABASE</p>
          <h2 className="headline-md" style={{ textTransform: 'uppercase' }}>Contacts</h2>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} className="btn btn-primary" onClick={() => { setEditingContact(null); setShowModal(true); }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>NEW CONTACT
        </motion.button>
      </motion.div>

      <motion.div variants={itemVariants} style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['All', 'Active', 'Lead', 'Prospect', 'Inactive'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className="label-sm"
            style={{ padding: '8px 16px', border: 'none', cursor: 'pointer', background: statusFilter === s ? 'var(--on-surface)' : 'var(--surface-container)', color: statusFilter === s ? 'var(--surface)' : 'var(--on-surface)', fontFamily: 'var(--font-headline)', letterSpacing: '0.06em', transition: 'all 0.2s' }}>
            {s}
          </button>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} style={{ background: 'var(--surface-container-lowest)' }}>
        {loading ? (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '64px' }} />)}
          </div>
        ) : contacts.length === 0 ? (
          <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '56px', marginBottom: '12px', display: 'block' }}>person_add</span>
            <p className="body-md" style={{ marginBottom: '16px' }}>No contacts yet. Add your first one!</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>ADD CONTACT</button>
          </div>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--surface-container-high)' }}>
                  {['Contact', 'Company', 'Email', 'Status', 'Valuation'].map(h => (
                    <th key={h} className="label-sm" style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact, i) => (
                  <motion.tr key={contact._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedContact(contact)} style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-container-low)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', background: i % 3 === 0 ? 'var(--primary)' : i % 3 === 1 ? 'var(--secondary)' : 'var(--tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.75rem' }}>
                          {contact.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="title-sm">{contact.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }} className="body-sm">{contact.company || '—'}</td>
                    <td style={{ padding: '14px 16px' }} className="body-sm">{contact.email || '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${contact.status === 'Active' ? 'badge-green' : contact.status === 'Lead' ? 'badge-blue' : contact.status === 'Prospect' ? 'badge-gold' : 'badge-gray'}`}>{contact.status}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-headline)', fontWeight: 700 }}>
                      {contact.valuation ? `$${contact.valuation.toLocaleString()}` : '—'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showModal && <ContactModal contact={editingContact} onClose={() => { setShowModal(false); setEditingContact(null); }} onSave={handleSave} />}
        {selectedContact && <ContactDetail contact={selectedContact} onClose={() => setSelectedContact(null)} onEdit={handleEdit} onDelete={handleDelete} />}
      </AnimatePresence>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media (max-width: 600px) {
          .modal-grid { grid-template-columns: 1fr !important; }
          div[style*="alignItems: 'flex-end'"] { flex-direction: column; align-items: flex-start !important; gap: 16px; }
        }
      `}</style>
    </motion.div>
  );
}
