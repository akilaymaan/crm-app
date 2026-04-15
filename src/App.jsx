import { useState } from 'react';
import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import ProtectedRoute from './components/ProtectedRoute';
import AIChat from './components/AIChat';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Pipeline from './pages/Pipeline';
import Tasks from './pages/Tasks';
import Settings from './pages/Settings';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

function CRMLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="main-content">
        <TopNav
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="page-content"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
      <AIChat />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              background: 'var(--inverse-surface)',
              color: 'var(--inverse-on-surface)',
              borderRadius: '0',
              padding: '12px 20px',
            },
            success: { iconTheme: { primary: '#2ecc40', secondary: 'white' } },
            error: { iconTheme: { primary: 'var(--primary)', secondary: 'white' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route element={<ProtectedRoute><CRMLayout /></ProtectedRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}
