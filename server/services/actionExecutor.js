const Contact = require('../models/Contact');
const Deal = require('../models/Deal');
const Task = require('../models/Task');
const AuditLog = require('../models/AuditLog');

/**
 * Resolve "due tomorrow", "due today", ISO dates etc into a real Date object
 */
function resolveDate(val) {
  if (!val) return undefined;
  const v = String(val).toUpperCase();
  const now = new Date();
  if (v === 'TODAY') {
    now.setHours(23, 59, 59, 0);
    return now;
  }
  if (v === 'TOMORROW') {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(23, 59, 59, 0);
    return d;
  }
  const parsed = new Date(val);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Build a due-date MongoDB query
 */
function buildDueDateQuery(data) {
  const now = new Date();
  if (data.due_today) {
    const start = new Date(now); start.setHours(0, 0, 0, 0);
    const end = new Date(now); end.setHours(23, 59, 59, 999);
    return { dueDate: { $gte: start, $lte: end } };
  }
  if (data.due_tomorrow) {
    const start = new Date(now); start.setDate(now.getDate() + 1); start.setHours(0, 0, 0, 0);
    const end = new Date(now); end.setDate(now.getDate() + 1); end.setHours(23, 59, 59, 999);
    return { dueDate: { $gte: start, $lte: end } };
  }
  return {};
}

/**
 * Log every AI action to the AuditLog collection
 */
async function logAction(userId, userName, action, payload, result, success = true) {
  try {
    await AuditLog.create({ userId, userName, action, payload, result, success });
  } catch (e) {
    console.error('[AuditLog] Failed to write log:', e.message);
  }
}

/**
 * Main executor — receives the parsed intent + authenticated user
 * @param {Object} intent - { action, data }
 * @param {Object} user   - req.user from JWT
 * @returns {Object} { success, data, message, count }
 */
async function executeAction(intent, user) {
  const { action, data = {} } = intent;
  const userId = user._id;
  const userName = user.name || user.email;
  let result;

  try {
    switch (action) {

      /* ---- CONTACTS ---- */
      case 'get_contacts': {
        let query = { createdBy: userId };
        if (data.search) {
          query.$or = [
            { name: { $regex: data.search, $options: 'i' } },
            { email: { $regex: data.search, $options: 'i' } },
            { company: { $regex: data.search, $options: 'i' } },
          ];
        }
        if (data.status) query.status = data.status;
        if (data.city) {
          // City matching on company or notes field (no dedicated city field in schema)
          const cityOr = [
            { company: { $regex: data.city, $options: 'i' } },
            { notes: { $regex: data.city, $options: 'i' } },
          ];
          query.$or = query.$or ? [...query.$or, ...cityOr] : cityOr;
        }
        const contacts = await Contact.find(query).sort({ createdAt: -1 }).limit(20);
        result = { success: true, data: contacts, count: contacts.length };
        break;
      }

      case 'create_contact': {
        if (!data.name) throw new Error('Contact name is required');
        const contact = await Contact.create({ ...data, createdBy: userId });
        result = { success: true, data: contact, message: `✅ Contact "${contact.name}" created successfully!` };
        break;
      }

      case 'update_contact': {
        let contact;
        if (data.id) {
          contact = await Contact.findOneAndUpdate(
            { _id: data.id, createdBy: userId },
            data,
            { new: true, runValidators: true }
          );
        } else if (data.name_hint) {
          const found = await Contact.findOne({
            createdBy: userId,
            name: { $regex: data.name_hint, $options: 'i' },
          });
          if (found) {
            contact = await Contact.findOneAndUpdate({ _id: found._id }, data, { new: true });
          }
        }
        if (!contact) throw new Error('Contact not found');
        result = { success: true, data: contact, message: `✅ Contact "${contact.name}" updated!` };
        break;
      }

      case 'delete_contact': {
        let contact;
        if (data.id) {
          contact = await Contact.findOneAndDelete({ _id: data.id, createdBy: userId });
        } else if (data.name_hint) {
          const found = await Contact.findOne({
            createdBy: userId,
            name: { $regex: data.name_hint, $options: 'i' },
          });
          if (found) contact = await Contact.findOneAndDelete({ _id: found._id });
        }
        if (!contact) throw new Error('Contact not found');
        result = { success: true, message: `🗑️ Contact "${contact.name}" deleted.` };
        break;
      }

      /* ---- DEALS ---- */
      case 'get_deals': {
        let query = { createdBy: userId };
        if (data.stage) query.stage = data.stage;
        if (data.min_value || data.max_value) {
          query.value = {};
          if (data.min_value) query.value.$gte = Number(data.min_value);
          if (data.max_value) query.value.$lte = Number(data.max_value);
        }
        let dealsQuery = Deal.find(query).populate('contactId', 'name company').sort({ createdAt: -1 }).limit(20);
        if (data.contact_name) {
          // post-filter by contact name
          const deals = await dealsQuery;
          const filtered = deals.filter(d =>
            d.contactId && d.contactId.name && d.contactId.name.toLowerCase().includes(data.contact_name.toLowerCase())
          );
          result = { success: true, data: filtered, count: filtered.length };
        } else {
          const deals = await dealsQuery;
          result = { success: true, data: deals, count: deals.length };
        }
        break;
      }

      case 'create_deal': {
        if (!data.title) throw new Error('Deal title is required');
        if (!data.value) throw new Error('Deal value is required');
        let contactId;
        if (data.contact_name) {
          const c = await Contact.findOne({ createdBy: userId, name: { $regex: data.contact_name, $options: 'i' } });
          if (c) contactId = c._id;
        }
        const deal = await Deal.create({
          title: data.title,
          value: Number(data.value),
          stage: data.stage || 'Prospect',
          probability: data.probability || 20,
          notes: data.notes || '',
          contactId,
          createdBy: userId,
        });
        result = { success: true, data: deal, message: `✅ Deal "${deal.title}" worth ₹${deal.value.toLocaleString()} created!` };
        break;
      }

      case 'update_deal': {
        let deal;
        if (data.id) {
          deal = await Deal.findOneAndUpdate({ _id: data.id, createdBy: userId }, data, { new: true });
        } else if (data.title_hint) {
          const found = await Deal.findOne({ createdBy: userId, title: { $regex: data.title_hint, $options: 'i' } });
          if (found) deal = await Deal.findOneAndUpdate({ _id: found._id }, data, { new: true });
        }
        if (!deal) throw new Error('Deal not found');
        result = { success: true, data: deal, message: `✅ Deal "${deal.title}" updated!` };
        break;
      }

      case 'delete_deal': {
        let deal;
        if (data.id) {
          deal = await Deal.findOneAndDelete({ _id: data.id, createdBy: userId });
        } else if (data.title_hint) {
          const found = await Deal.findOne({ createdBy: userId, title: { $regex: data.title_hint, $options: 'i' } });
          if (found) deal = await Deal.findOneAndDelete({ _id: found._id });
        }
        if (!deal) throw new Error('Deal not found');
        result = { success: true, message: `🗑️ Deal "${deal.title}" deleted.` };
        break;
      }

      /* ---- TASKS ---- */
      case 'get_tasks': {
        let query = { createdBy: userId };
        if (data.status) query.status = data.status;
        if (data.priority) query.priority = data.priority;
        if (data.search) query.title = { $regex: data.search, $options: 'i' };
        if (data.assigned_to) query.assignedTo = { $regex: data.assigned_to, $options: 'i' };
        const dateQuery = buildDueDateQuery(data);
        Object.assign(query, dateQuery);
        const tasks = await Task.find(query).sort({ dueDate: 1, createdAt: -1 }).limit(20);
        result = { success: true, data: tasks, count: tasks.length };
        break;
      }

      case 'create_task': {
        if (!data.title) throw new Error('Task title is required');
        const task = await Task.create({
          title: data.title,
          description: data.description || '',
          dueDate: resolveDate(data.dueDate),
          status: data.status || 'Pending',
          priority: data.priority || 'Medium',
          assignedTo: data.assignedTo || '',
          createdBy: userId,
        });
        result = { success: true, data: task, message: `✅ Task "${task.title}" created successfully!` };
        break;
      }

      case 'update_task': {
        const updatePayload = { ...data };
        if (updatePayload.dueDate) updatePayload.dueDate = resolveDate(updatePayload.dueDate);
        let task;
        if (data.id) {
          task = await Task.findOneAndUpdate({ _id: data.id, createdBy: userId }, updatePayload, { new: true });
        } else if (data.title_hint) {
          const found = await Task.findOne({ createdBy: userId, title: { $regex: data.title_hint, $options: 'i' } });
          if (found) task = await Task.findOneAndUpdate({ _id: found._id }, updatePayload, { new: true });
        }
        if (!task) throw new Error('Task not found');
        result = { success: true, data: task, message: `✅ Task "${task.title}" updated!` };
        break;
      }

      case 'delete_task': {
        let task;
        if (data.id) {
          task = await Task.findOneAndDelete({ _id: data.id, createdBy: userId });
        } else if (data.title_hint) {
          const found = await Task.findOne({ createdBy: userId, title: { $regex: data.title_hint, $options: 'i' } });
          if (found) task = await Task.findOneAndDelete({ _id: found._id });
        }
        if (!task) throw new Error('Task not found');
        result = { success: true, message: `🗑️ Task "${task.title}" deleted.` };
        break;
      }

      /* ---- SUMMARY ---- */
      case 'get_summary': {
        const [contacts, deals, tasks] = await Promise.all([
          Contact.countDocuments({ createdBy: userId }),
          Deal.find({ createdBy: userId }),
          Task.find({ createdBy: userId }),
        ]);
        const revenue = deals.filter(d => d.stage === 'Closed Won').reduce((s, d) => s + d.value, 0);
        const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
        result = {
          success: true,
          data: {
            totalContacts: contacts,
            totalDeals: deals.length,
            closedWon: deals.filter(d => d.stage === 'Closed Won').length,
            revenue,
            pendingTasks,
          },
          message: `📊 CRM Summary: ${contacts} contacts, ${deals.length} deals, ₹${revenue.toLocaleString()} revenue, ${pendingTasks} pending tasks.`,
        };
        break;
      }

      /* ---- SCHEDULE handled by caller ---- */
      case 'schedule_task': {
        result = { success: true, _defer_to_scheduler: true, data };
        break;
      }

      case 'unknown':
      default: {
        result = { success: false, message: intent.message || "I didn't understand that request." };
        break;
      }
    }

    await logAction(userId, userName, action, data, result, result.success);
    return result;

  } catch (err) {
    const errResult = { success: false, message: `❌ ${err.message}` };
    await logAction(userId, userName, action, data, errResult, false);
    return errResult;
  }
}

module.exports = { executeAction };
