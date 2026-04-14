const express = require('express');
const router = express.Router();
const { getDeals, createDeal, updateDeal, deleteDeal, getDealStats } = require('../controllers/dealController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getDealStats);
router.route('/').get(getDeals).post(createDeal);
router.route('/:id').put(updateDeal).delete(deleteDeal);

module.exports = router;
