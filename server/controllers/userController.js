const User = require('../models/User');

const ROLES = ['admin', 'manager', 'analyst', 'member'];

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users, count: users.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update user role
// @route   PATCH /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    if (!role || !ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role provided' });
    }

    if (id === req.user.id || id === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, message: 'Cannot down-grade the last remaining admin user.' });
      }
    }

    user.role = role;
    await user.save();

    res.json({ success: true, message: `User role updated to ${role}`, data: { id: user._id, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
