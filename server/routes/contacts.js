const express = require('express');
const router = express.Router();
const { getContacts, createContact, updateContact, deleteContact, addHistory } = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getContacts).post(createContact);
router.route('/:id').put(updateContact).delete(deleteContact);
router.post('/:id/history', addHistory);

module.exports = router;
