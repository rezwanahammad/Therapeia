const mongoose = require('mongoose');
const Order = require('../models/order');
const User = require('../models/user');
const { bus } = require('../services/events');

// POST /api/orders
// body: { items?: [{ productId, quantity }], note? }
async function createOrder(req, res, next) {
  try {
    const userId = req.userId;
    const body = req.body || {};

    let items = [];
    if (Array.isArray(body.items) && body.items.length > 0) {
      // Build items from provided payload
      const pids = body.items.map(i => new mongoose.Types.ObjectId(String(i.productId)));
      const products = await mongoose.model('product').find({ _id: { $in: pids } }).lean();
      const prodMap = new Map(products.map(p => [String(p._id), p]));
      items = body.items.map(i => {
        const pid = String(i.productId);
        const p = prodMap.get(pid);
        if (!p) throw new Error('Invalid product in order');
        const qty = Math.max(1, Number(i.quantity || 1));
        return { product: p._id, name: p.name, price: p.price, quantity: qty };
      });
    } else {
      // Fallback: use user's cart
      const user = await User.findById(userId).populate('cart.product').lean();
      if (!user || !user.cart || user.cart.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }
      items = user.cart.map(ci => ({ product: ci.product._id, name: ci.product.name, price: ci.product.price, quantity: ci.quantity }));
    }

    const totalAmount = items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0), 0);
    const order = await Order.create({ user: userId, items, totalAmount, status: 'pending', statusHistory: [] });
    order.addStatus('pending', body.note || 'Order placed', 'user', userId);
    await order.save();

    // Notify via SSE
    bus.emit(`order:${order._id}:status`, { id: String(order._id), status: order.status, history: order.statusHistory });

    return res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}

// GET /api/orders
async function listMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 }).lean();
    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

// GET /api/orders/:id
async function getMyOrder(req, res, next) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).lean();
    if (!order || String(order.user) !== String(req.userId)) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

// GET /api/orders/:id/status
async function getMyOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).lean();
    if (!order || String(order.user) !== String(req.userId)) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ status: order.status, history: order.statusHistory });
  } catch (err) {
    next(err);
  }
}

// GET /api/orders/:id/stream
function streamOrderStatus(req, res) {
  const { id } = req.params;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let closed = false;
  const send = (data) => {
    if (closed) return;
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const handler = (payload) => send(payload);

  // Initial snapshot
  Order.findById(id).lean().then(order => {
    if (order && String(order.user) === String(req.userId)) {
      send({ id: String(order._id), status: order.status, history: order.statusHistory });
    }
  }).catch(() => {});

  bus.on(`order:${id}:status`, handler);
  req.on('close', () => { closed = true; bus.off(`order:${id}:status`, handler); });
}

module.exports = { createOrder, listMyOrders, getMyOrder, getMyOrderStatus, streamOrderStatus };