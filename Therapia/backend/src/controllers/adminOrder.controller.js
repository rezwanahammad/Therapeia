const Order = require('../models/order');
const { bus } = require('../services/events');

// GET /api/admin/orders
async function listOrders(req, res, next) {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    res.json({ orders });
  } catch (err) { next(err); }
}

// PUT /api/admin/orders/:id/status
async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, note } = req.body || {};
    if (!status) return res.status(400).json({ message: 'status is required' });
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.canTransitionTo(status)) {
      return res.status(400).json({ message: `Cannot transition from ${order.status} to ${status}` });
    }
    order.addStatus(status, note || `Set to ${status}`, 'admin', req.adminId);
    order.audit.push({ type: 'status_change', adminId: req.adminId, details: { from: order.status, to: status, note }, at: new Date() });
    await order.save();
    bus.emit(`order:${order._id}:status`, { id: String(order._id), status: order.status, history: order.statusHistory });
    res.json({ order });
  } catch (err) { next(err); }
}

// PUT /api/admin/orders/:id/tracking
async function updateTracking(req, res, next) {
  try {
    const { id } = req.params;
    const { carrier, trackingNumber, url, shippedAt, deliveredAt } = req.body || {};
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.tracking = {
      carrier: carrier || order.tracking?.carrier,
      trackingNumber: trackingNumber || order.tracking?.trackingNumber,
      url: url || order.tracking?.url,
      shippedAt: shippedAt ? new Date(shippedAt) : order.tracking?.shippedAt,
      deliveredAt: deliveredAt ? new Date(deliveredAt) : order.tracking?.deliveredAt,
    };
    order.audit.push({ type: 'update_tracking', adminId: req.adminId, details: order.tracking, at: new Date() });
    await order.save();
    bus.emit(`order:${order._id}:status`, { id: String(order._id), status: order.status, history: order.statusHistory });
    res.json({ order });
  } catch (err) { next(err); }
}

// POST /api/admin/orders/:id/cancel
async function cancelOrder(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    if (!reason) return res.status(400).json({ message: 'Cancel reason is required' });
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    // Allow cancel unless delivered
    if (order.status === 'delivered') {
      return res.status(400).json({ message: 'Cannot cancel a delivered order' });
    }
    order.canceledReason = reason;
    order.addStatus('canceled', reason, 'admin', req.adminId);
    order.audit.push({ type: 'cancel', adminId: req.adminId, details: { reason }, at: new Date() });
    await order.save();
    bus.emit(`order:${order._id}:status`, { id: String(order._id), status: order.status, history: order.statusHistory });
    res.json({ order });
  } catch (err) { next(err); }
}

// GET /api/admin/orders/:id/audit
async function getAudit(req, res, next) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ audit: order.audit, statusHistory: order.statusHistory });
  } catch (err) { next(err); }
}

module.exports = { listOrders, updateOrderStatus, updateTracking, cancelOrder, getAudit };