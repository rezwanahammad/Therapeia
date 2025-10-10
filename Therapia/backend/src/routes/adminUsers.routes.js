const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/user');
const Order = require('../models/order');

// GET /api/admin/users
router.get('/', adminAuth, async (req, res, next) => {
  try {
    const users = await User.find({}).lean();
    const ids = users.map(u => u._id);
    const agg = await Order.aggregate([
      { $match: { user: { $in: ids } } },
      { $group: { _id: '$user', total: { $sum: 1 } } },
    ]);
    const totals = new Map(agg.map(a => [String(a._id), a.total]));
    const payload = users.map(u => ({
      _id: u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      addresses: u.addresses || [],
      totalOrders: totals.get(String(u._id)) || 0,
    }));
    res.json({ users: payload });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/users/:id
router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    // Optionally, we could also anonymize or reassign orders. For now, leave orders in place.
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;