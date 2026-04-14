const Deal = require('../models/Deal');

// GET /api/deals
exports.getDeals = async (req, res) => {
  try {
    const { stage } = req.query;
    let query = { createdBy: req.user._id };
    if (stage && stage !== 'All') query.stage = stage;

    const deals = await Deal.find(query).populate('contactId', 'name company').sort({ createdAt: -1 });
    res.json({ success: true, count: deals.length, data: deals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/deals
exports.createDeal = async (req, res) => {
  try {
    const deal = await Deal.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: deal });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/deals/:id
exports.updateDeal = async (req, res) => {
  try {
    const deal = await Deal.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('contactId', 'name company');
    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
    res.json({ success: true, data: deal });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/deals/:id
exports.deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
    res.json({ success: true, message: 'Deal deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/deals/stats - Dashboard metrics
exports.getDealStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const deals = await Deal.find({ createdBy: userId });
    const activeDeals = deals.filter(d => d.stage !== 'Closed Lost');
    const revenue = deals.filter(d => d.stage === 'Closed Won').reduce((s, d) => s + d.value, 0);
    const projected = activeDeals.reduce((s, d) => s + (d.value * d.probability) / 100, 0);

    res.json({
      success: true,
      data: {
        totalDeals: deals.length,
        activeDeals: activeDeals.length,
        closedWon: deals.filter(d => d.stage === 'Closed Won').length,
        revenue,
        projected: Math.round(projected),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
