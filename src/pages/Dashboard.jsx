import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import toast from 'react-hot-toast';
import { dealsAPI, contactsAPI, tasksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function SkeletonCard() {
  return (
    <div className="skeleton" style={{ height: '160px', padding: '32px' }}>
      <div className="skeleton" style={{ height: '12px', width: '60%', marginBottom: '16px' }} />
      <div className="skeleton" style={{ height: '48px', width: '40%', marginBottom: '12px' }} />
      <div className="skeleton" style={{ height: '10px', width: '70%' }} />
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--inverse-surface)',
        color: 'var(--inverse-on-surface)',
        padding: '12px 16px',
        fontFamily: 'var(--font-body)',
        fontSize: '0.8125rem',
      }}>
        <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, marginBottom: '4px' }}>{label}</p>
        <p>Value: <strong>${(payload[0]?.value / 1000 || 0).toFixed(0)}K</strong></p>
      </div>
    );
  }
  return null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dealRes, contactRes, taskRes, dealList] = await Promise.all([
          dealsAPI.getStats(),
          contactsAPI.getAll(),
          tasksAPI.getStats(),
          dealsAPI.getAll(),
        ]);
        setStats({
          ...dealRes.data.data,
          totalContacts: contactRes.data.count,
          ...taskRes.data.data,
        });
        setContacts(contactRes.data.data.slice(0, 5));
        setTasks({ ...taskRes.data.data });
        setDeals(dealList.data.data);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Build chart data from actual deals grouped by month
  const chartData = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const map = {};
    months.forEach(m => { map[m] = 0; });
    deals.forEach(d => {
      if (d.stage === 'Closed Won') {
        const month = new Date(d.createdAt).toLocaleString('en-US', { month: 'short' });
        if (map[month] !== undefined) map[month] += d.value;
      }
    });
    return months.slice(0, new Date().getMonth() + 1).map(m => ({ month: m, revenue: map[m] }));
  })();

  const pendingTasks = deals.filter(d => d.stage === 'Prospect').slice(0, 4);

  const metricCards = stats ? [
    {
      label: 'TOTAL CONTACTS',
      value: stats.totalContacts?.toLocaleString() || '0',
      change: `In Organization`,
      sub: '',
      bg: 'linear-gradient(135deg, #bc000a, #e61919)',
    },
    {
      label: 'ACTIVE DEALS',
      value: stats.activeDeals?.toLocaleString() || '0',
      change: `${stats.closedWon || 0} closed won`,
      sub: '',
      bg: 'linear-gradient(135deg, #1a3f8f, #2b59c3)',
    },
    {
      label: 'REVENUE',
      value: `$${stats.revenue >= 1000000 ? (stats.revenue / 1000000).toFixed(1) + 'M' : (stats.revenue / 1000).toFixed(0) + 'K'}`,
      change: `+$${(stats.projected / 1000).toFixed(0)}K projected`,
      sub: '',
      bg: 'linear-gradient(135deg, #6b5400, #8d6e00)',
    },
  ] : null;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <motion.div variants={itemVariants} style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '32px',
        borderBottom: '4px solid var(--on-surface)',
        paddingBottom: '16px',
      }}>
        <div>
          <p className="label-sm" style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>WORKSPACE OVERVIEW</p>
          <h2 className="headline-md" style={{ textTransform: 'uppercase' }}>Strategic Performance</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className="label-sm" style={{ color: 'var(--text-muted)' }}>
            Welcome, {user?.name?.split(' ')[0]}
          </span>
          <span className="badge badge-blue">Q3 REPORT LIVE</span>
        </div>
      </motion.div>

      {/* Metric Cards */}
      <motion.div variants={itemVariants} style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {loading
          ? [0, 1, 2].map(i => <SkeletonCard key={i} />)
          : metricCards?.map((card) => (
          <motion.div
            key={card.label}
            whileHover={{ scale: 1.03, boxShadow: 'var(--shadow-hover)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              background: card.bg,
              padding: '32px',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            <div style={{ position: 'absolute', top: '16px', right: '16px', width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
            <p className="label-sm" style={{ opacity: 0.8, marginBottom: '12px', color: 'white' }}>{card.label}</p>
            <p className="display-lg" style={{ marginBottom: '8px', color: 'white' }}>{card.value}</p>
            <p style={{ fontSize: '0.8125rem', opacity: 0.9 }}>{card.change}</p>
            <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '80px', height: '80px', background: 'rgba(255,255,255,0.08)', transform: 'rotate(45deg)' }} />
          </motion.div>
        ))}
      </motion.div>

      {/* Chart + Pending Actions Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '32px' }}>
        <motion.div variants={itemVariants} style={{ background: 'var(--surface-container-lowest)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid var(--surface-container)', paddingBottom: '12px' }}>
            <h3 className="headline-sm" style={{ textTransform: 'uppercase' }}>Revenue Pipeline</h3>
            <span className="label-sm" style={{ color: 'var(--text-muted)' }}>CLOSED WON BY MONTH</span>
          </div>
          {loading ? (
            <div className="skeleton" style={{ height: '280px' }} />
          ) : chartData.length === 0 ? (
            <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-muted)', gap: '12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>bar_chart</span>
              <p className="body-sm">Close deals to see revenue data</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="0" stroke="var(--surface-container)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Inter', fill: '#888' }} tickLine={false} axisLine={{ stroke: 'var(--surface-container-high)' }} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'Inter', fill: '#888' }} tickLine={false} axisLine={false} tickFormatter={v => `${v / 1000}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="var(--surface-container-high)" radius={0} animationDuration={1200} />
                <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} dot={false} animationDuration={1500} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Pending Prospects */}
        <motion.div variants={itemVariants} style={{ background: 'var(--surface-container-lowest)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid var(--surface-container)', paddingBottom: '12px' }}>
            <h3 className="headline-sm" style={{ textTransform: 'uppercase' }}>Prospects</h3>
            {loading ? null : <span className="badge badge-red">{pendingTasks.length}</span>}
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[0,1,2].map(i => <div key={i} className="skeleton" style={{ height: '48px' }} />)}
            </div>
          ) : pendingTasks.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-muted)', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>inbox</span>
              <p className="body-sm">No prospects yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              {pendingTasks.map((deal, i) => (
                <motion.div
                  key={deal._id}
                  whileHover={{ x: 4, background: 'var(--surface-container-low)' }}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', cursor: 'pointer', transition: 'background 0.2s' }}
                >
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--tertiary)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p className="body-sm" style={{ fontWeight: 600 }}>{deal.title}</p>
                    <p className="label-xs" style={{ color: 'var(--text-muted)' }}>${(deal.value / 1000).toFixed(0)}K • {deal.probability}%</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Global Accounts — Dark Table */}
      <motion.div variants={itemVariants} className="table-dark" style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="headline-sm" style={{ textTransform: 'uppercase', color: 'var(--inverse-on-surface)' }}>Global Accounts</h3>
          <span className="label-sm" style={{ color: 'var(--text-muted)' }}>{contacts.length} RECENT</span>
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[0,1,2].map(i => <div key={i} className="skeleton" style={{ height: '56px' }} />)}
          </div>
        ) : contacts.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '12px', display: 'block' }}>contacts</span>
            <p className="body-md">No contacts yet — add your first one!</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  {['Contact', 'Organization', 'Status', 'Valuation'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact, i) => (
                  <motion.tr key={contact._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }} style={{ cursor: 'pointer' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px', height: '36px',
                          background: i % 3 === 0 ? 'var(--primary)' : i % 3 === 1 ? 'var(--secondary)' : 'var(--tertiary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.75rem',
                        }}>
                          {contact.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{contact.name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{contact.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--inverse-on-surface)' }}>{contact.company || '—'}</td>
                    <td>
                      <span className={`badge ${contact.status === 'Active' ? 'badge-green' : contact.status === 'Lead' ? 'badge-blue' : contact.status === 'Prospect' ? 'badge-gold' : 'badge-gray'}`}>
                        {contact.status}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--inverse-on-surface)' }}>
                      {contact.valuation ? `$${(contact.valuation / 1000).toFixed(0)}K` : '—'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          style={{ position: 'absolute', bottom: '-20px', right: '24px', width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-elevated)' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>add</span>
        </motion.button>
      </motion.div>

      <style>{`@media(max-width:768px){div[style*="grid-template-columns: repeat(3"]{grid-template-columns:1fr!important}div[style*="grid-template-columns: 2fr 1fr"]{grid-template-columns:1fr!important}div[style*="alignItems: 'flex-end'"]{flex-direction:column; align-items:flex-start!important; gap:16px;}}`}</style>
    </motion.div>
  );
}
