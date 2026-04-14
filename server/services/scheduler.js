const cron = require('node-cron');
const Task = require('../models/Task');
const ScheduledTask = require('../models/ScheduledTask');

// In-memory registry of active cron jobs: key = scheduledTaskId
const jobRegistry = new Map();

/**
 * Map natural language time expressions to cron strings
 * Examples:
 *   "every Sunday 9pm"       → "0 21 * * 0"
 *   "every Monday 9am"       → "0 9 * * 1"
 *   "every day 8am"          → "0 8 * * *"
 *   "every weekday 10am"     → "0 10 * * 1-5"
 *   "every Friday 6pm"       → "0 18 * * 5"
 */
function parseTimeExpression(expression) {
  const expr = expression.toLowerCase().trim();

  const days = {
    sunday: 0, sun: 0,
    monday: 1, mon: 1,
    tuesday: 2, tue: 2,
    wednesday: 3, wed: 3,
    thursday: 4, thu: 4,
    friday: 5, fri: 5,
    saturday: 6, sat: 6,
  };

  // Extract hour from "9pm", "10am", "2:30pm", etc.
  const timeMatch = expr.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);
  let hour = 9; // default 9am
  let minute = 0;
  if (timeMatch) {
    hour = parseInt(timeMatch[1], 10);
    minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    if (timeMatch[3] === 'pm' && hour !== 12) hour += 12;
    if (timeMatch[3] === 'am' && hour === 12) hour = 0;
  }

  // Check for "every day" or "daily"
  if (expr.includes('every day') || expr.includes('daily')) {
    return { cron: `${minute} ${hour} * * *`, human: expression };
  }

  // Check for "every weekday"
  if (expr.includes('weekday')) {
    return { cron: `${minute} ${hour} * * 1-5`, human: expression };
  }

  // Check for "every weekend"
  if (expr.includes('weekend')) {
    return { cron: `${minute} ${hour} * * 0,6`, human: expression };
  }

  // Check for specific day names
  for (const [dayName, dayNum] of Object.entries(days)) {
    if (expr.includes(dayName)) {
      return { cron: `${minute} ${hour} * * ${dayNum}`, human: expression };
    }
  }

  // Default: every day at extracted time
  return { cron: `${minute} ${hour} * * *`, human: expression };
}

/**
 * Create a cron job in memory and register it
 */
function startJob(scheduledTaskDoc, userId) {
  const { cronExpression, taskData, _id } = scheduledTaskDoc;

  if (!cron.validate(cronExpression)) {
    console.warn(`[Scheduler] Invalid cron expression: ${cronExpression}`);
    return false;
  }

  const job = cron.schedule(cronExpression, async () => {
    try {
      const task = await Task.create({
        title: taskData.title,
        description: taskData.description || `Scheduled: ${scheduledTaskDoc.humanReadable}`,
        priority: taskData.priority || 'Medium',
        status: 'Pending',
        createdBy: userId,
      });
      await ScheduledTask.findByIdAndUpdate(_id, { lastRun: new Date() });
      console.log(`[Scheduler] ✅ Created task "${task.title}" for user ${userId}`);
    } catch (err) {
      console.error(`[Scheduler] ❌ Failed to create task: ${err.message}`);
    }
  });

  jobRegistry.set(String(_id), job);
  return true;
}

/**
 * Schedule a new task from AI intent
 */
async function scheduleTask(data, userId) {
  const { title, description, priority, schedule_expression } = data;

  if (!schedule_expression) throw new Error('schedule_expression is required');
  if (!title) throw new Error('Task title is required for scheduling');

  const { cron: cronExpression, human } = parseTimeExpression(schedule_expression);

  if (!cron.validate(cronExpression)) {
    throw new Error(`Could not parse schedule: "${schedule_expression}". Try something like "every Monday 9am" or "every day 6pm"`);
  }

  const scheduledTask = await ScheduledTask.create({
    userId,
    cronExpression,
    humanReadable: human,
    taskData: { title, description: description || '', priority: priority || 'Medium' },
    active: true,
  });

  startJob(scheduledTask, userId);

  return {
    success: true,
    data: scheduledTask,
    message: `⏰ Task "${title}" scheduled — ${human}. It will auto-create in your task list at the scheduled time.`,
  };
}

/**
 * Cancel a scheduled job
 */
async function cancelSchedule(scheduleId) {
  const job = jobRegistry.get(String(scheduleId));
  if (job) { job.stop(); jobRegistry.delete(String(scheduleId)); }
  await ScheduledTask.findByIdAndUpdate(scheduleId, { active: false });
  return { success: true, message: 'Schedule cancelled.' };
}

/**
 * Load all active schedules from DB and start them (called on server boot)
 */
async function reloadSchedules() {
  try {
    const activeSchedules = await ScheduledTask.find({ active: true });
    let started = 0;
    for (const schedule of activeSchedules) {
      const ok = startJob(schedule, schedule.userId);
      if (ok) started++;
    }
    console.log(`[Scheduler] 🔄 Reloaded ${started}/${activeSchedules.length} active schedules`);
  } catch (err) {
    console.error('[Scheduler] Failed to reload schedules:', err.message);
  }
}

module.exports = { scheduleTask, cancelSchedule, reloadSchedules, parseTimeExpression };
