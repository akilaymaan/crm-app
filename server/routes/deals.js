const express = require('express');
const router = express.Router();
const { getDeals, createDeal, updateDeal, deleteDeal, getDealStats } = require('../controllers/dealController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getDealStats);
router.route('/').get(getDeals).post(authorize('admin', 'manager'), createDeal);
router.route('/:id').put(authorize('admin', 'manager'), updateDeal).delete(authorize('admin', 'manager'), deleteDeal);

module.exports = router;
