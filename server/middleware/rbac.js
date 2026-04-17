/**
 * RBAC rules for AI chat actions
 *
 * Admin   → full access to everything
 * Manager → all except delete operations
 * User    → read-only + create_task + create_contact + schedule_task + get_summary
 */

const ROLE_PERMISSIONS = {
  admin: [
    'get_contacts', 'create_contact', 'update_contact', 'delete_contact',
    'get_deals', 'create_deal', 'update_deal', 'delete_deal',
    'get_tasks', 'create_task', 'update_task', 'delete_task',
    'schedule_task', 'get_summary', 'unknown',
  ],
  manager: [
    'get_contacts', 'create_contact', 'update_contact', 'delete_contact',
    'get_deals', 'create_deal', 'update_deal', 'delete_deal',
    'get_tasks', 'create_task', 'update_task', 'delete_task',
    'schedule_task', 'get_summary', 'unknown',
  ],
  analyst: [
    'get_contacts', 'get_deals',
    'get_tasks', 'create_task', 'update_task', 'delete_task',
    'schedule_task', 'get_summary', 'unknown',
  ],
  member: [
    'get_contacts', 'get_deals',
    'get_tasks', 'create_task', 'update_task', 'delete_task',
    'schedule_task', 'get_summary', 'unknown',
  ],
};

/**
 * Check if a user role is permitted to execute a given action
 * @param {string} role - 'admin' | 'manager' | 'user'
 * @param {string} action - e.g. 'delete_contact'
 * @returns {{ allowed: boolean, reason?: string }}
 */
function checkPermission(role, action) {
  const normalizedRole = (role || 'member').toLowerCase();
  const allowed = ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS.member;

  if (allowed.includes(action)) {
    return { allowed: true };
  }

  const friendlyAction = action.replace(/_/g, ' ');
  const friendlyRole = normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1);

  return {
    allowed: false,
    reason: `❌ Permission denied. As a **${friendlyRole}**, you cannot perform "${friendlyAction}". Please contact an Admin.`,
  };
}

module.exports = { checkPermission };
