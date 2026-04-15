const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask, getTaskStats } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getTaskStats);
router.route('/').get(getTasks).post(authorize('admin', 'manager', 'member'), createTask);
router.route('/:id').put(authorize('admin', 'manager', 'member'), updateTask).delete(authorize('admin'), deleteTask);

module.exports = router;
