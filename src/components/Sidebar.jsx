import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'grid_view' },
  { path: '/contacts', label: 'Contacts', icon: 'group' },
  { path: '/pipeline', label: 'Pipeline', icon: 'analytics' },
  { path: '/tasks', label: 'Tasks', icon: 'assignment' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
];

export default function Sidebar({ isOpen, onToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 45,
              display: 'none',
            }}
          />
        )}
      </AnimatePresence>

      <aside
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100%',
          width: 'var(--sidebar-width)',
          background: 'var(--surface)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen ? 'translateX(0)' : undefined,
        }}
        className="sidebar"
      >
        {/* Logo */}
        <div style={{ padding: '32px 24px 16px' }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              {/* Bauhaus Logo */}
              <div style={{
                width: '36px',
                height: '36px',
                position: 'relative',
                flexShrink: 0,
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '3px solid var(--on-surface)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    background: 'var(--primary)',
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                  }} />
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: 'var(--secondary)',
                    position: 'absolute',
                    bottom: '6px',
                    right: '6px',
                    borderRadius: '50%',
                  }} />
                  <div style={{
                    width: '6px',
                    height: '6px',
                    background: '#FFD700',
                    position: 'absolute',
                    bottom: '4px',
                    left: '8px',
                  }} />
                </div>
              </div>
              <h1 style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                fontFamily: 'var(--font-headline)',
                letterSpacing: '-0.02em',
                color: 'var(--on-surface)',
              }}>
                CLIENTO
              </h1>
            </div>
            <p className="label-xs" style={{ color: 'var(--text-muted)', marginLeft: '48px' }}>
              BAUHAUS CRM
            </p>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '8px' }}>
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.15 + index * 0.05 }}
              >
                <NavLink
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) onToggle?.();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '14px 24px',
                    textDecoration: 'none',
                    color: isActive ? 'var(--on-primary)' : 'var(--on-surface)',
                    background: isActive ? 'var(--secondary)' : 'transparent',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'var(--surface-container)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span
                    className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}
                    style={{ fontSize: '22px' }}
                  >
                    {item.icon}
                  </span>
                  <span className="label-sm" style={{
                    fontFamily: 'var(--font-headline)',
                    letterSpacing: '0.08em',
                  }}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        background: 'var(--primary)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </NavLink>
              </motion.div>
            );
          })}
        </nav>

        {/* Add Record Button */}
        {['admin', 'manager'].includes(user?.role) && (
          <div style={{ padding: '16px 24px' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                navigate('/contacts');
                if (window.innerWidth < 1024) onToggle?.();
              }}
              className="btn btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '16px',
                fontSize: '0.75rem',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              ADD RECORD
            </motion.button>
          </div>
        )}

        {/* Footer */}
        <footer style={{ borderTop: '1px solid var(--surface-container-high)' }}>
          <button
            onClick={() => {
              import('react-hot-toast').then(({ default: toast }) => {
                toast('Help Center coming soon!', { icon: 'ℹ️', style: { background: 'var(--surface-container-high)', color: 'var(--on-surface)' } });
              });
              if (window.innerWidth < 1024) onToggle?.();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '14px 24px',
              width: '100%',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none',
              color: 'var(--on-surface)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>help</span>
            <span className="label-sm" style={{ fontFamily: 'var(--font-headline)', letterSpacing: '0.08em' }}>Help</span>
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/login');
              if (window.innerWidth < 1024) onToggle?.();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '14px 24px',
              width: '100%',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none',
              color: 'var(--on-surface)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
            <span className="label-sm" style={{ fontFamily: 'var(--font-headline)', letterSpacing: '0.08em' }}>Sign Out</span>
          </button>
        </footer>
      </aside>

      <style>{`
        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(${isOpen ? '0' : '-100%'}) !important;
          }
          .sidebar-overlay {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
