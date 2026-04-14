const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { chat, confirm } = require('../controllers/aiController');

router.post('/chat', protect, chat);
router.post('/confirm', protect, confirm);

module.exports = router;
