const express = require('express');
const router = express.Router();
const { getContacts, createContact, updateContact, deleteContact, addHistory } = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getContacts).post(authorize('admin', 'manager'), createContact);
router.route('/:id').put(authorize('admin', 'manager'), updateContact).delete(authorize('admin', 'manager'), deleteContact);
router.post('/:id/history', authorize('admin', 'manager'), addHistory);

module.exports = router;
