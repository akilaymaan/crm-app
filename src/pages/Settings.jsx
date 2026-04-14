import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const roles = [
  { name: 'Admin', desc: 'Full access to all features', color: 'var(--primary)', icon: 'admin_panel_settings' },
  { name: 'Manager', desc: 'Access to team data and reports', color: 'var(--secondary)', icon: 'supervisor_account' },
  { name: 'Analyst', desc: 'View-only access to analytics', color: 'var(--tertiary)', icon: 'analytics' },
  { name: 'Member', desc: 'Basic CRM access', color: 'var(--text-muted)', icon: 'person' },
];

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success('Settings saved');
    setSaving(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Signed out');
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: '900px' }}>
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', borderBottom: '4px solid var(--on-surface)', paddingBottom: '12px' }}>
        <div>
          <p className="label-sm" style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>CONFIGURATION</p>
          <h2 className="headline-md" style={{ textTransform: 'uppercase' }}>Settings</h2>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={handleLogout}
          className="btn" style={{ background: 'var(--error)', color: 'white' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>SIGN OUT
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} style={{ display: 'flex', gap: '0', marginBottom: '32px' }}>
        {['profile', 'roles', 'preferences'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className="label-sm"
            style={{ padding: '12px 24px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-headline)', letterSpacing: '0.06em', background: activeTab === tab ? 'var(--on-surface)' : 'var(--surface-container)', color: activeTab === tab ? 'var(--surface)' : 'var(--on-surface)', transition: 'all 0.2s', textTransform: 'capitalize' }}>
            {tab}
          </button>
        ))}
      </motion.div>

      {activeTab === 'profile' && (
        <motion.div variants={itemVariants} style={{ background: 'var(--surface-container-lowest)', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid var(--surface-container)' }}>
            <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, var(--primary), var(--primary-container))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '1.75rem' }}>
              {profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="headline-sm">{profile.name}</h3>
              <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>{profile.email}</p>
              <span className="badge badge-red" style={{ marginTop: '8px', display: 'inline-flex' }}>{user?.role?.toUpperCase() || 'MEMBER'}</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            {[{ key: 'name', label: 'Full Name' }, { key: 'email', label: 'Email' }].map(f => (
              <div key={f.key}>
                <label className="label-sm" style={{ display: 'block', marginBottom: '8px', color: 'var(--on-surface-variant)' }}>{f.label}</label>
                <input className="input-bauhaus" value={profile[f.key]} onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />&nbsp;Saving...</> : 'SAVE CHANGES'}
            </motion.button>
          </div>
        </motion.div>
      )}

      {activeTab === 'roles' && (
        <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {roles.map(role => (
            <motion.div key={role.name} whileHover={{ x: 4, boxShadow: 'var(--shadow-ambient)' }} style={{ background: 'var(--surface-container-lowest)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: `4px solid ${role.color}`, cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ width: '48px', height: '48px', background: `${role.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: role.color }}>{role.icon}</span>
              </div>
              <div style={{ flex: 1 }}>
                <h4 className="title-sm" style={{ marginBottom: '4px' }}>{role.name}</h4>
                <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>{role.desc}</p>
              </div>
              {user?.role === role.name.toLowerCase() && <span className="badge badge-green">CURRENT</span>}
              <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)' }}>chevron_right</span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {activeTab === 'preferences' && (
        <motion.div variants={itemVariants} style={{ background: 'var(--surface-container-lowest)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {[
            { label: 'Email Notifications', desc: 'Receive email alerts for new tasks and deals', checked: true },
            { label: 'Desktop Notifications', desc: 'Show browser notifications', checked: true },
            { label: 'Dark Mode', desc: 'Switch to dark theme (coming soon)', checked: false },
            { label: 'Auto-Archive Completed', desc: 'Auto-archive completed tasks after 7 days', checked: false },
          ].map((pref, i, arr) => (
            <div key={pref.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: i < arr.length - 1 ? '24px' : 0, borderBottom: i < arr.length - 1 ? '1px solid var(--surface-container)' : 'none' }}>
              <div>
                <h4 className="title-sm" style={{ marginBottom: '4px' }}>{pref.label}</h4>
                <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>{pref.desc}</p>
              </div>
              <button onClick={() => toast.success(`${pref.label} updated`)} style={{ width: '48px', height: '24px', background: pref.checked ? 'var(--primary)' : 'var(--surface-container-high)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s' }}>
                <span style={{ position: 'absolute', width: '18px', height: '18px', background: 'white', top: '3px', left: pref.checked ? '26px' : '4px', transition: 'left 0.3s' }} />
              </button>
            </div>
          ))}
        </motion.div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </motion.div>
  );
}
