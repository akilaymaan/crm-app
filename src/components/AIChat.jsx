import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ─── Quick suggestion chips shown on first open ─── */
const SUGGESTIONS = [
  'Show all my contacts',
  'Get pending tasks',
  'Deals above ₹1 lakh',
  'Create a task called Follow up',
  'CRM summary',
];

/* ─── Humanise action names for labels ─── */
const ACTION_LABELS = {
  get_contacts: 'Contacts',
  create_contact: 'Contact Created',
  update_contact: 'Contact Updated',
  delete_contact: 'Contact Deleted',
  get_deals: 'Deals',
  create_deal: 'Deal Created',
  update_deal: 'Deal Updated',
  delete_deal: 'Deal Deleted',
  get_tasks: 'Tasks',
  create_task: 'Task Created',
  update_task: 'Task Updated',
  delete_task: 'Task Deleted',
  schedule_task: 'Scheduled',
  get_summary: 'CRM Summary',
};

/* ─── Render a compact result card for list data ─── */
function ResultCard({ action, result }) {
  if (!result || !result.success) return null;
  const data = result.data;

  if (action === 'get_summary' && data) {
    return (
      <div className="ai-result-card">
        <div className="ai-result-grid">
          <div className="ai-stat"><span className="ai-stat-val">{data.totalContacts}</span><span className="ai-stat-label">Contacts</span></div>
          <div className="ai-stat"><span className="ai-stat-val">{data.totalDeals}</span><span className="ai-stat-label">Deals</span></div>
          <div className="ai-stat"><span className="ai-stat-val">{data.closedWon}</span><span className="ai-stat-label">Won</span></div>
          <div className="ai-stat"><span className="ai-stat-val">₹{(data.revenue || 0).toLocaleString('en-IN')}</span><span className="ai-stat-label">Revenue</span></div>
          <div className="ai-stat"><span className="ai-stat-val">{data.pendingTasks}</span><span className="ai-stat-label">Pending Tasks</span></div>
        </div>
      </div>
    );
  }

  if (Array.isArray(data) && data.length > 0) {
    const isContact = action.includes('contact');
    const isDeal = action.includes('deal');
    const isTask = action.includes('task');

    return (
      <div className="ai-result-card">
        <div className="ai-result-label">{ACTION_LABELS[action] || action} ({data.length})</div>
        <div className="ai-result-list">
          {data.slice(0, 5).map((item, i) => (
            <div key={i} className="ai-result-item">
              {isContact && (
                <>
                  <span className="ai-item-name">{item.name}</span>
                  <span className="ai-item-sub">{item.company || item.email || ''}</span>
                  <span className={`ai-badge ai-badge-${item.status?.toLowerCase()}`}>{item.status}</span>
                </>
              )}
              {isDeal && (
                <>
                  <span className="ai-item-name">{item.title}</span>
                  <span className="ai-item-sub">₹{(item.value || 0).toLocaleString('en-IN')}</span>
                  <span className={`ai-badge ai-badge-${item.stage?.toLowerCase().replace(' ', '-')}`}>{item.stage}</span>
                </>
              )}
              {isTask && (
                <>
                  <span className="ai-item-name">{item.title}</span>
                  <span className="ai-item-sub">{item.priority}</span>
                  <span className={`ai-badge ai-badge-${item.status?.toLowerCase().replace(' ', '-')}`}>{item.status}</span>
                </>
              )}
            </div>
          ))}
          {data.length > 5 && (
            <div className="ai-result-more">+{data.length - 5} more results</div>
          )}
        </div>
      </div>
    );
  }

  if (data && !Array.isArray(data)) {
    // Single created/updated item
    const name = data.name || data.title || '';
    if (!name) return null;
    return (
      <div className="ai-result-card ai-result-single">
        <span className="material-symbols-outlined filled" style={{ color: '#2ecc40', fontSize: '16px' }}>check_circle</span>
        <span className="ai-item-name">{name}</span>
      </div>
    );
  }

  return null;
}

/* ─── Typing indicator component ─── */
function TypingIndicator() {
  return (
    <div className="ai-msg ai-msg-bot">
      <div className="ai-avatar">
        <span className="material-symbols-outlined filled">smart_toy</span>
      </div>
      <div className="ai-bubble ai-bubble-bot">
        <div className="ai-typing-dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}

export default function AIChat() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingIntent, setPendingIntent] = useState(null);
  const [hasNew, setHasNew] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Greeting on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        id: Date.now(),
        role: 'bot',
        text: `👋 Hi ${user?.name?.split(' ')[0] || 'there'}! I'm your CLIENTO AI assistant.\n\nI can help you manage contacts, deals, tasks, and more — just type naturally!`,
        action: null,
        result: null,
      }]);
    }
    if (open) {
      setHasNew(false);
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [open]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const addMessage = useCallback((msg) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), ...msg }]);
  }, []);

  const buildHistory = useCallback((msgs) => {
    return msgs
      .filter(m => m.role === 'user' || m.role === 'bot')
      .slice(-8)
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));
  }, []);

  const sendMessage = useCallback(async (messageText) => {
    const text = (messageText || input).trim();
    if (!text || loading) return;

    setInput('');
    setPendingIntent(null);

    addMessage({ role: 'user', text });
    setLoading(true);

    try {
      const history = buildHistory(messages);
      const { data } = await aiAPI.chat(text, history);

      const botMsg = {
        role: 'bot',
        text: data.reply || '✅ Done!',
        action: data.action,
        result: data.actionResult,
        requiresConfirmation: data.requiresConfirmation,
        pendingIntentData: data.pendingIntent,
      };

      addMessage(botMsg);
      if (data.requiresConfirmation && data.pendingIntent) {
        setPendingIntent(data.pendingIntent);
      }

      if (!open) setHasNew(true);
    } catch (err) {
      addMessage({
        role: 'bot',
        text: '❌ Connection error. Please check your network and try again.',
        action: null,
        result: null,
      });
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, open, addMessage, buildHistory]);

  const handleConfirm = useCallback(async () => {
    if (!pendingIntent) return;
    setLoading(true);
    setPendingIntent(null);

    addMessage({ role: 'user', text: '✅ Yes, confirmed.' });

    try {
      const { data } = await aiAPI.confirm(pendingIntent);
      addMessage({
        role: 'bot',
        text: data.reply || '✅ Done!',
        action: data.action,
        result: data.actionResult,
      });
    } catch {
      addMessage({ role: 'bot', text: '❌ Error confirming action.', action: null, result: null });
    } finally {
      setLoading(false);
    }
  }, [pendingIntent, addMessage]);

  const handleCancel = useCallback(() => {
    setPendingIntent(null);
    addMessage({ role: 'bot', text: '↩️ Action cancelled. Anything else I can help with?', action: null, result: null });
  }, [addMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Floating Button ── */}
      <motion.button
        id="ai-chat-fab"
        className="ai-fab"
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        aria-label="Open AI Assistant"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" className="material-symbols-outlined" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              close
            </motion.span>
          ) : (
            <motion.span key="open" className="material-symbols-outlined filled" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              smart_toy
            </motion.span>
          )}
        </AnimatePresence>
        {hasNew && !open && <span className="ai-fab-dot" />}
      </motion.button>

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="ai-chat-window"
            className="ai-chat-window"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          >
            {/* Header */}
            <div className="ai-header">
              <div className="ai-header-info">
                <div className="ai-header-icon">
                  <span className="material-symbols-outlined filled">smart_toy</span>
                </div>
                <div>
                  <div className="ai-header-title">CLIENTO AI</div>
                  <div className="ai-header-sub">Powered by Gemini</div>
                </div>
              </div>
              <div className="ai-header-actions">
                <button
                  className="ai-icon-btn"
                  title="Clear chat"
                  onClick={() => { setMessages([]); setPendingIntent(null); }}
                >
                  <span className="material-symbols-outlined">restart_alt</span>
                </button>
                <button className="ai-icon-btn" onClick={() => setOpen(false)} title="Close">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="ai-messages" id="ai-messages-container">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`ai-msg ai-msg-${msg.role}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {msg.role === 'bot' && (
                    <div className="ai-avatar">
                      <span className="material-symbols-outlined filled">smart_toy</span>
                    </div>
                  )}
                  <div className={`ai-bubble ai-bubble-${msg.role}`}>
                    <p className="ai-bubble-text">{msg.text}</p>
                    {msg.result && (
                      <ResultCard action={msg.action} result={msg.result} />
                    )}
                    {msg.requiresConfirmation && pendingIntent && (
                      <div className="ai-confirm-row">
                        <button className="ai-confirm-btn ai-confirm-yes" onClick={handleConfirm} id="ai-confirm-yes">
                          <span className="material-symbols-outlined">check</span> Yes, proceed
                        </button>
                        <button className="ai-confirm-btn ai-confirm-no" onClick={handleCancel} id="ai-confirm-no">
                          <span className="material-symbols-outlined">close</span> Cancel
                        </button>
                      </div>
                    )}
                    {msg.action && msg.action !== 'unknown' && (
                      <div className="ai-action-tag">
                        <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>bolt</span>
                        {ACTION_LABELS[msg.action] || msg.action}
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="ai-avatar ai-avatar-user">
                      <span className="material-symbols-outlined filled">person</span>
                    </div>
                  )}
                </motion.div>
              ))}

              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions (show when only greeting visible) */}
            {messages.length <= 1 && !loading && (
              <div className="ai-suggestions">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} className="ai-suggestion-chip" onClick={() => sendMessage(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="ai-input-row">
              <textarea
                ref={inputRef}
                id="ai-chat-input"
                className="ai-input"
                placeholder="Ask me anything about your CRM..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={loading}
              />
              <button
                id="ai-send-btn"
                className="ai-send-btn"
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                aria-label="Send message"
              >
                <span className="material-symbols-outlined filled">send</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
