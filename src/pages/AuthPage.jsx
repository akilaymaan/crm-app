import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (mode === 'register' && !form.name.trim()) errs.name = 'Name is required';
    if (!form.email.match(/^\S+@\S+\.\S+$/)) errs.email = 'Enter a valid email';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (mode === 'register' && form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        await register(form.name, form.email, form.password);
        toast.success('Account created!');
      }
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      toast.error(msg);
      setErrors({ api: msg });
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, type = 'text', show = true) => show ? (
    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>{label}</label>
      <input
        className="input-bauhaus"
        type={type}
        value={form[key]}
        onChange={(e) => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })); }}
        placeholder={`Enter ${label.toLowerCase()}`}
        disabled={loading}
        style={{ paddingBottom: '10px' }}
      />
      {errors[key] && (
        <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
          {errors[key]}
        </span>
      )}
    </div>
  ) : null;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--surface)',
    }}>
      {/* Left accent panel */}
      <div style={{
        width: '420px',
        background: 'var(--on-surface)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }} className="auth-panel">
        {/* Decorative blocks */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: 'var(--primary)', opacity: 0.8 }} />
        <div style={{ position: 'absolute', bottom: '80px', left: 0, width: '80px', height: '80px', background: 'var(--secondary)', opacity: 0.6 }} />
        <div style={{ position: 'absolute', bottom: 0, right: '40px', width: '60px', height: '60px', background: '#FFD700', opacity: 0.5, borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              border: '3px solid white', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: '12px', height: '12px', background: 'var(--primary)', position: 'absolute', top: '4px', left: '4px' }} />
              <div style={{ width: '8px', height: '8px', background: 'var(--secondary)', position: 'absolute', bottom: '5px', right: '5px', borderRadius: '50%' }} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-headline)', color: 'white', letterSpacing: '-0.02em' }}>CLIENTO</h1>
          </div>
          <p className="label-xs" style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '52px' }}>BAUHAUS CRM</p>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '2.25rem', fontWeight: 900, fontFamily: 'var(--font-headline)', color: 'white', lineHeight: 1.15, marginBottom: '16px' }}>
            Where Relationships Turn Into Revenue.
          </p>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
            The Bauhaus CRM built for precision, efficiency, and results.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', maxWidth: '440px' }}
          >
            <div style={{
              borderBottom: '4px solid var(--on-surface)',
              paddingBottom: '16px',
              marginBottom: '32px',
            }}>
              <p className="label-sm" style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
                {mode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}
              </p>
              <h2 className="headline-md" style={{ textTransform: 'uppercase' }}>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </h2>
            </div>

            {errors.api && (
              <div style={{
                background: 'var(--error-container)',
                color: 'var(--error)',
                padding: '12px 16px',
                marginBottom: '20px',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                {errors.api}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {field('name', 'Full Name', 'text', mode === 'register')}
              {field('email', 'Email Address', 'email')}
              {field('password', 'Password', 'password')}
              {field('confirmPassword', 'Confirm Password', 'password', mode === 'register')}

              <motion.button
                type="submit"
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                disabled={loading}
                className="btn btn-primary"
                style={{
                  justifyContent: 'center',
                  padding: '16px',
                  fontSize: '0.8125rem',
                  opacity: loading ? 0.8 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '8px',
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    {mode === 'login' ? 'SIGNING IN...' : 'CREATING ACCOUNT...'}
                  </>
                ) : (
                  mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'
                )}
              </motion.button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <p className="body-sm" style={{ color: 'var(--text-muted)' }}>
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--primary)', fontWeight: 700, fontFamily: 'var(--font-headline)',
                    textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em',
                  }}
                >
                  {mode === 'login' ? 'Register' : 'Sign In'}
                </button>
              </p>
            </div>

            {/* Demo hint */}
            {mode === 'login' && (
              <div style={{
                marginTop: '24px',
                padding: '12px 16px',
                background: 'var(--surface-container)',
                borderLeft: '3px solid var(--secondary)',
              }}>
                <p className="label-xs" style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>DEMO ACCOUNT</p>
                <p className="body-sm">You can register a new account above to get started.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .auth-panel { display: none !important; } }
      `}</style>
    </div>
  );
}
