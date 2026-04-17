const { GoogleGenerativeAI } = require('@google/generative-ai');

// Lazy-init: don't crash the server at startup if key is missing
let _genAI = null;
function getGenAI() {
  if (!_genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _genAI;
}

const SYSTEM_PROMPT = `You are an intelligent AI assistant for CLIENTO, a professional CRM system.
Your ONLY job is to convert user requests into structured JSON action commands.

CRITICAL RULES:
1. ALWAYS respond with valid JSON only. No plain text, no markdown, no code blocks.
2. Never respond with explanation text outside JSON.
3. If you cannot understand the request, return: {"action":"unknown","data":{},"message":"I couldn't understand that request. Try: 'Show me all contacts', 'Create a task called X', 'Get deals above 50000'"}

AVAILABLE ACTIONS:
- get_contacts: Query contacts. Supports: search (text), status (Lead/Prospect/Active/Inactive), city (text)
- create_contact: Create contact. Requires: name. Optional: email, phone, company, status, valuation, notes
- update_contact: Update contact. Requires: id OR name_hint. Optional: any field to update
- delete_contact: Delete contact. Requires: id OR name_hint. ALWAYS set confirmation_required: true
- get_deals: Query deals. Supports: stage (Prospect/Negotiation/Closed Won/Closed Lost), min_value, max_value, contact_name
- create_deal: Create deal. Requires: title, value. Optional: stage, probability, notes, contact_name
- update_deal: Update deal. Requires: id OR title_hint. Optional: any field to update
- delete_deal: Delete deal. Requires: id OR title_hint. ALWAYS set confirmation_required: true
- get_tasks: Query tasks. Supports: status (Pending/In Progress/Completed), priority (Low/Medium/High), due_today, due_tomorrow, assigned_to, search
- create_task: Create task. Requires: title. Optional: description, dueDate (ISO string), priority, assignedTo
- update_task: Update task. Requires: id OR title_hint. Optional: any field to update
- delete_task: Delete task. Requires: id OR title_hint. ALWAYS set confirmation_required: true
- schedule_task: Schedule recurring task. Requires: title, schedule_expression (e.g. "every Sunday 9pm", "every Monday 9am"). Optional: description, priority
- get_summary: Get CRM summary stats. No data required.

RESPONSE FORMAT (always return this exact JSON structure, nothing else):
{"action":"<action_name>","data":{<fields>},"confirmation_required":false,"message":"<optional>"}

EXAMPLES:
User: "Show me all contacts"
Response: {"action":"get_contacts","data":{},"confirmation_required":false}

User: "Leads from Delhi"
Response: {"action":"get_contacts","data":{"status":"Lead","city":"Delhi"},"confirmation_required":false}

User: "Create a task called Follow up with Akil due tomorrow with high priority"
Response: {"action":"create_task","data":{"title":"Follow up with Akil","priority":"High","dueDate":"TOMORROW"},"confirmation_required":false}

User: "Deals above 1 lakh"
Response: {"action":"get_deals","data":{"min_value":100000},"confirmation_required":false}

User: "Schedule a call task every Sunday 9pm"
Response: {"action":"schedule_task","data":{"title":"Call","schedule_expression":"every Sunday 9pm"},"confirmation_required":false}

User: "Delete contact John"
Response: {"action":"delete_contact","data":{"name_hint":"John"},"confirmation_required":true,"message":"Are you sure you want to delete the contact matching John? This cannot be undone."}

User: "Tasks due tomorrow"
Response: {"action":"get_tasks","data":{"due_tomorrow":true},"confirmation_required":false}`;

/**
 * Call Gemini with conversation history and return parsed JSON action
 * @param {string} userMessage
 * @param {Array} history - array of {role, parts} objects
 */
async function parseIntent(userMessage, history = []) {
  const genAI = getGenAI();

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 512,
      responseMimeType: 'application/json',
    },
  });

  // Build chat history for context (last 8 exchanges max)
  const safeHistory = (history || []).slice(-8).filter(
    h => h && h.role && Array.isArray(h.parts) && h.parts.length > 0
  );

  let text;
  try {
    if (safeHistory.length > 0) {
      const chat = model.startChat({ history: safeHistory });
      const result = await chat.sendMessage(userMessage);
      text = result.response.text();
    } else {
      // No history — use direct generateContent for reliability
      const result = await model.generateContent(
        `${SYSTEM_PROMPT}\n\nUser: ${userMessage}\nResponse:`
      );
      text = result.response.text();
    }
  } catch (apiErr) {
    console.error('[Gemini] API call failed:', apiErr.message);
    if (apiErr.message.includes('API key was reported as leaked') || apiErr.status === 403) {
      return { action: 'unknown', data: {}, message: '❌ Your Gemini API key is reported as leaked or invalid. Please update it in the server .env file.' };
    }
    return { action: 'unknown', data: {}, message: '❌ AI Provider Error: ' + apiErr.message };
  }

  // Strip accidental markdown fences
  const cleaned = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to extract first JSON object
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* fall through */ }
    }
    return {
      action: 'unknown',
      data: {},
      confirmation_required: false,
      message: "I couldn't parse that request. Please try rephrasing.",
    };
  }
}

module.exports = { parseIntent };
