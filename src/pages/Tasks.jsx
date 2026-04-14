import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { tasksAPI } from '../services/api';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const priorityColors = { High: 'var(--primary)', Medium: 'var(--secondary)', Low: 'var(--tertiary)' };
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dateRange = [12, 13, 14, 15, 16, 17, 18];

function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState(task || { title: '', description: '', dueDate: '', priority: 'Medium', assignedTo: '', status: 'Pending' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title required'); return; }
    setLoading(true);
    try {
      await onSave(form);
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
          <h3 className="headline-sm" style={{ textTransform: 'uppercase' }}>{task ? 'Edit Task' : 'New Directive'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><span className="material-symbols-outlined">close</span></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="label-sm" style={{ display: 'block', marginBottom: '8px', color: 'var(--on-surface-variant)' }}>TITLE</label>
            <input className="input-bauhaus" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Task title..." />
          </div>
          <div>
            <label className="label-sm" style={{ display: 'block', marginBottom: '8px', color: 'var(--on-surface-variant)' }}>DESCRIPTION</label>
            <textarea className="input-bauhaus" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ resize: 'vertical' }} placeholder="Details..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="label-sm" style={{ display: 'block', marginBottom: '8px', color: 'var(--on-surface-variant)' }}>DUE DATE</label>
              <input className="input-bauhaus" type="date" value={form.dueDate ? form.dueDate.slice(0, 10) : ''} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div>
              <label className="label-sm" style={{ display: 'block', marginBottom: '8px', color: 'var(--on-surface-variant)' }}>ASSIGNED TO</label>
              <input className="input-bauhaus" value={form.assignedTo || ''} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} placeholder="Name..." />
            </div>
          </div>
          <div>
            <label className="label-sm" style={{ display: 'block', marginBottom: '8px', color: 'var(--on-surface-variant)' }}>PRIORITY</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Low', 'Medium', 'High'].map(p => (
                <button key={p} type="button" onClick={() => setForm(f => ({ ...f, priority: p }))}
                  style={{ flex: 1, padding: '10px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-headline)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, background: form.priority === p ? priorityColors[p] : 'var(--surface-container)', color: form.priority === p ? 'white' : 'var(--on-surface)', transition: 'all 0.2s' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label-sm" style={{ display: 'block', marginBottom: '8px', color: 'var(--on-surface-variant)' }}>STATUS</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Pending', 'In Progress', 'Completed'].map(s => (
                <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
                  style={{ flex: 1, padding: '8px 4px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-headline)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, background: form.status === s ? 'var(--on-surface)' : 'var(--surface-container)', color: form.status === s ? 'white' : 'var(--on-surface)', transition: 'all 0.2s' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? '...' : task ? 'UPDATE TASK' : 'CREATE DIRECTIVE'}
            </button>
            <button type="button" onClick={onClose} className="btn" style={{ background: 'var(--surface-container)', color: 'var(--on-surface)' }}>Cancel</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function Tasks({ searchQuery = '' }) {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(12);
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      const [taskRes, statsRes] = await Promise.all([tasksAPI.getAll(params), tasksAPI.getStats()]);
      setTasks(taskRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleSave = async (formData) => {
    if (editingTask) {
      const { data } = await tasksAPI.update(editingTask._id, formData);
      setTasks(prev => prev.map(t => t._id === editingTask._id ? data.data : t));
      toast.success('Task updated');
    } else {
      const { data } = await tasksAPI.create(formData);
      setTasks(prev => [data.data, ...prev]);
      toast.success('Task created');
    }
    setEditingTask(null);
  };

  const handleToggle = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    const { data } = await tasksAPI.update(task._id, { status: newStatus });
    setTasks(prev => prev.map(t => t._id === task._id ? data.data : t));
    toast.success(newStatus === 'Completed' ? 'Task completed! ✓' : 'Task reopened');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    await tasksAPI.delete(id);
    setTasks(prev => prev.filter(t => t._id !== id));
    toast.success('Task deleted');
  };

  const activeTasks = tasks.filter(t => t.status !== 'Completed');
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const efficiency = stats ? Math.round((stats.completed / (stats.total || 1)) * 100) : 0;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: '1400px' }}>
      {/* Timeline */}
      <motion.div variants={itemVariants} style={{ background: 'var(--surface-container-low)', padding: '16px 24px', marginBottom: '24px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
        <div style={{ flexShrink: 0, paddingRight: '32px' }}>
          <p className="label-sm" style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>TIMELINE</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.875rem', fontWeight: 700, fontFamily: 'var(--font-headline)', letterSpacing: '-0.02em' }}>OCTOBER</span>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', cursor: 'pointer' }}>calendar_today</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', flex: 1 }} className="no-scrollbar">
          {dateRange.map((date, i) => (
            <motion.div key={date} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedDate(date)}
              style={{ width: '56px', height: '80px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: selectedDate === date ? 'var(--primary)' : 'var(--surface-container-lowest)', color: selectedDate === date ? 'white' : 'var(--on-surface)', transition: 'all 0.2s' }}>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: selectedDate === date ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>{days[i]}</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-headline)' }}>{date}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left: Tasks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <motion.section variants={itemVariants}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '4px solid var(--on-surface)', paddingBottom: '8px' }}>
              <h3 className="headline-sm" style={{ textTransform: 'uppercase' }}>Pending Operations</h3>
              <span className="label-sm" style={{ background: 'var(--secondary)', color: 'white', padding: '4px 12px' }}>
                {String(activeTasks.length).padStart(2, '0')} ACTIVE
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {['All', 'Pending', 'In Progress', 'Completed'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className="label-xs"
                  style={{ padding: '6px 14px', border: 'none', cursor: 'pointer', background: statusFilter === s ? 'var(--on-surface)' : 'var(--surface-container)', color: statusFilter === s ? 'var(--surface)' : 'var(--on-surface)', transition: 'all 0.2s' }}>
                  {s}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[0,1,2].map(i => <div key={i} className="skeleton" style={{ height: '100px' }} />)}
              </div>
            ) : activeTasks.length === 0 && !loading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface-container-lowest)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>task_alt</span>
                <p className="body-md">All tasks complete! Add a new directive.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeTasks.map((task, i) => (
                  <motion.div key={task._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ background: 'var(--surface-container-low)' }}
                    style={{ background: 'var(--surface-container-lowest)', padding: '20px 24px', display: 'flex', gap: '20px', alignItems: 'flex-start', borderLeft: `6px solid ${priorityColors[task.priority]}`, transition: 'background 0.2s' }}>
                    <div style={{ marginTop: '2px' }}>
                      <input type="checkbox" checked={task.status === 'Completed'} onChange={() => handleToggle(task)} style={{ width: '22px', height: '22px', accentColor: 'var(--primary)', cursor: 'pointer' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <h4 className="headline-sm" style={{ fontSize: '1.05rem', flex: 1 }}>{task.title}</h4>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0, marginLeft: '8px' }}>
                          <span className="label-xs" style={{ background: 'var(--surface-container)', padding: '4px 10px' }}>
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}
                          </span>
                          <button onClick={() => { setEditingTask(task); setShowModal(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                          </button>
                          <button onClick={() => handleDelete(task._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                          </button>
                        </div>
                      </div>
                      {task.description && <p className="body-sm" style={{ color: 'var(--on-surface-variant)', marginBottom: '12px', lineHeight: 1.6 }}>{task.description}</p>}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {task.assignedTo && (
                          <div style={{ width: '28px', height: '28px', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.6rem', color: 'var(--on-surface-variant)' }}>
                            {task.assignedTo.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="label-xs" style={{ color: priorityColors[task.priority], display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{task.priority === 'High' ? 'priority_high' : task.priority === 'Medium' ? 'schedule' : 'low_priority'}</span>
                          {task.priority} Priority
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>

          {/* Archived */}
          {completedTasks.length > 0 && (
            <motion.section variants={itemVariants} style={{ opacity: 0.6, filter: 'grayscale(0.5)', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.filter = 'none'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.filter = 'grayscale(0.5)'; }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '2px solid var(--surface-container-high)', paddingBottom: '8px' }}>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Archived Logic</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {completedTasks.map(task => (
                  <div key={task._id} style={{ background: 'var(--surface-container)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button onClick={() => handleToggle(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 0 }}>
                        <span className="material-symbols-outlined filled" style={{ fontSize: '20px', color: 'var(--text-muted)' }}>check_circle</span>
                      </button>
                      <span className="title-sm" style={{ textDecoration: 'line-through' }}>{task.title}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className="label-xs" style={{ color: 'var(--text-muted)' }}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                      <button onClick={() => handleDelete(task._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </div>

        {/* Right: Action Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Execute New Directive */}
          <motion.div variants={itemVariants} style={{ background: 'var(--primary)', padding: '32px', color: 'white', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.875rem', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1, textTransform: 'uppercase' }}>EXECUTE NEW DIRECTIVE</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <p className="label-xs" style={{ opacity: 0.8, maxWidth: '140px', lineHeight: 1.6, color: 'white' }}>Initialize a new task node within the grid.</p>
              <motion.button whileHover={{ scale: 0.95 }} whileTap={{ scale: 0.9 }} onClick={() => { setEditingTask(null); setShowModal(true); }}
                style={{ width: '64px', height: '64px', background: 'white', color: 'var(--primary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', fontWeight: 900 }}>add</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Efficiency */}
          <motion.div variants={itemVariants} style={{ background: 'var(--secondary)', padding: '32px', color: 'white' }}>
            <span className="label-sm" style={{ opacity: 0.8, display: 'block', marginBottom: '16px', color: 'white' }}>TOTAL EFFICIENCY</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '4.5rem', fontWeight: 900, fontFamily: 'var(--font-headline)', letterSpacing: '-0.03em', lineHeight: 1 }}>{efficiency}</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-headline)' }}>%</span>
            </div>
            <div style={{ marginTop: '32px', height: '4px', background: 'rgba(255,255,255,0.2)' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${efficiency}%` }} transition={{ duration: 1, delay: 0.5 }} style={{ height: '100%', background: 'white' }} />
            </div>
            {stats && (
              <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
                <span className="label-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{stats.completed}/{stats.total} done</span>
                {stats.inProgress > 0 && <span className="label-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{stats.inProgress} in progress</span>}
              </div>
            )}
          </motion.div>

          {/* Status Indicators */}
          <motion.div variants={itemVariants} style={{ background: 'var(--surface-container-high)', padding: '24px' }}>
            <h4 className="label-sm" style={{ marginBottom: '20px' }}>STATUS INDICATORS</h4>
            {[
              { label: 'Urgent Directive', color: 'var(--primary)', count: stats?.pending || 0 },
              { label: 'In Progress', color: 'var(--secondary)', count: stats?.inProgress || 0 },
              { label: 'Completed', color: 'var(--tertiary)', count: stats?.completed || 0 },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: item.color }} />
                <span className="label-xs" style={{ flex: 1 }}>{item.label}</span>
                <span className="label-xs" style={{ color: 'var(--text-muted)' }}>{item.count}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && <TaskModal task={editingTask} onClose={() => { setShowModal(false); setEditingTask(null); }} onSave={handleSave} />}
      </AnimatePresence>

      {/* FAB */}
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setEditingTask(null); setShowModal(true); }}
        style={{ position: 'fixed', bottom: '32px', right: '32px', width: '56px', height: '56px', borderRadius: '50%', background: 'var(--on-surface)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(27,27,27,0.15)', zIndex: 50 }}>
        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>add_task</span>
      </motion.button>

      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 2fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
    </motion.div>
  );
}
