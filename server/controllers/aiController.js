const { parseIntent } = require('../services/aiService');
const { executeAction } = require('../services/actionExecutor');
const { scheduleTask } = require('../services/scheduler');
const { checkPermission } = require('../middleware/rbac');

/**
 * POST /api/ai/chat
 * Body: { message: string, history?: [{role, parts}][], confirmed?: boolean }
 */
exports.chat = async (req, res) => {
  try {
    const { message, history = [], confirmed = false } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // 1. Parse intent with Gemini
    const intent = await parseIntent(message, history);

    const { action, data = {}, confirmation_required, message: aiMessage } = intent;

    // 2. If action is unknown, just return the message
    if (action === 'unknown') {
      return res.json({
        success: true,
        reply: aiMessage || "I didn't understand that. Try: 'Show my contacts', 'Create a task', 'Get deals above 50000'",
        action: 'unknown',
        actionResult: null,
      });
    }

    // 3. Check RBAC
    const userRole = req.user.role || 'user';
    const { allowed, reason } = checkPermission(userRole, action);
    if (!allowed) {
      return res.json({
        success: false,
        reply: reason,
        action,
        actionResult: null,
      });
    }

    // 4. Handle destructive actions: require confirmation
    if (confirmation_required && !confirmed) {
      return res.json({
        success: true,
        reply: aiMessage || `⚠️ Are you sure you want to ${action.replace(/_/g, ' ')}? This action cannot be undone.`,
        action,
        requiresConfirmation: true,
        pendingIntent: intent,
        actionResult: null,
      });
    }

    // 5. Handle scheduling separately
    if (action === 'schedule_task') {
      const result = await scheduleTask(data, req.user._id);
      return res.json({
        success: result.success,
        reply: result.message,
        action,
        actionResult: result,
      });
    }

    // 6. Execute the action
    const result = await executeAction(intent, req.user);

    // Build human-friendly reply
    let reply;
    if (!result.success) {
      reply = result.message || '❌ Something went wrong executing that action.';
    } else if (result.message) {
      reply = result.message;
    } else if (result.count !== undefined) {
      reply = `Found ${result.count} result${result.count !== 1 ? 's' : ''}.`;
    } else {
      reply = '✅ Done!';
    }

    return res.json({
      success: result.success,
      reply,
      action,
      actionResult: result,
    });

  } catch (err) {
    console.error('[AI Controller] Error:', err.message);
    return res.status(500).json({
      success: false,
      reply: '❌ AI service error. Please try again.',
      action: null,
      actionResult: null,
    });
  }
};

/**
 * POST /api/ai/confirm
 * Execute a previously confirmed destructive action
 */
exports.confirm = async (req, res) => {
  try {
    const { intent } = req.body;
    if (!intent || !intent.action) {
      return res.status(400).json({ success: false, message: 'Intent is required' });
    }

    const userRole = req.user.role || 'user';
    const { allowed, reason } = checkPermission(userRole, intent.action);
    if (!allowed) {
      return res.json({ success: false, reply: reason, action: intent.action, actionResult: null });
    }

    const result = await executeAction(intent, req.user);
    return res.json({
      success: result.success,
      reply: result.message || '✅ Done!',
      action: intent.action,
      actionResult: result,
    });
  } catch (err) {
    console.error('[AI Confirm] Error:', err.message);
    return res.status(500).json({ success: false, reply: '❌ Error executing action.', action: null, actionResult: null });
  }
};
