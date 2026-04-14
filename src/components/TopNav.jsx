import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const pageTitle = {
  '/': 'Dashboard',
  '/contacts': 'Contacts',
  '/pipeline': 'Pipeline',
  '/tasks': 'Tasks',
  '/settings': 'Settings',
};

export default function TopNav({ onMenuToggle, searchQuery, onSearchChange }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const title = pageTitle[location.pathname] || 'CLIENTO';

  // Close notification dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 24px',
      height: 'var(--topbar-height)',
      background: 'var(--surface-container-lowest)',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Left: Mobile menu + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="mobile-menu-btn"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--on-surface)',
            padding: '4px',
          }}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span
            className="material-symbols-outlined"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              fontSize: '20px',
            }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-search"
            style={{ width: '320px', paddingLeft: '40px' }}
            id="global-search"
          />
        </div>
      </div>

      {/* Right: Notifications + Settings + Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--on-surface-variant)',
              padding: '8px',
              borderRadius: 0,
              transition: 'background 0.2s',
              position: 'relative',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <span className="material-symbols-outlined">notifications</span>
            {/* Notification badge dot */}
            <div style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--primary)',
              border: '2px solid var(--surface-container-lowest)',
            }} />
          </button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  width: '320px',
                  background: 'var(--surface-container-lowest)',
                  boxShadow: 'var(--shadow-elevated)',
                  zIndex: 100,
                  marginTop: '8px',
                }}
              >
                <div style={{ padding: '16px', borderBottom: '2px solid var(--surface-container)' }}>
                  <h4 className="label-sm" style={{ color: 'var(--on-surface)' }}>NOTIFICATIONS</h4>
                </div>
                {[
                  { text: 'New deal closed — FormFactor Annual', time: '2m ago', color: 'var(--primary)' },
                  { text: 'Elena Vasquez updated contact info', time: '1h ago', color: 'var(--secondary)' },
                  { text: 'Task deadline approaching: NeoLine Review', time: '3h ago', color: 'var(--tertiary)' },
                ].map((notif, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--surface-container)',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container-low)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: notif.color,
                      marginTop: '6px',
                      flexShrink: 0,
                    }} />
                    <div>
                      <p className="body-sm" style={{ marginBottom: '2px' }}>{notif.text}</p>
                      <span className="label-xs" style={{ color: 'var(--text-muted)' }}>{notif.time}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings icon */}
        <button
          onClick={() => navigate('/settings')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--on-surface-variant)',
            padding: '8px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          <span className="material-symbols-outlined">settings</span>
        </button>

        {/* User Avatar */}
        <div 
          onClick={() => navigate('/settings')}
          style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'var(--font-headline)',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            border: '2px solid var(--primary)',
            marginLeft: '8px',
          }}
        >
          {user?.name ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'U'}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .mobile-menu-btn { display: block !important; }
          .input-search { width: 200px !important; }
        }
        @media (max-width: 640px) {
          .input-search { width: 140px !important; }
        }
      `}</style>
    </header>
  );
}
