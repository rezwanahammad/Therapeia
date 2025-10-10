const Order = require('../models/order')

async function listAll(req, res, next) {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean()
    return res.json({ orders })
  } catch (err) {
    next(err)
  }
}

async function setStatus(req, res, next) {
  try {
    const { id } = req.params
    const { status } = req.body || {}
    const allowed = ['placed', 'processing', 'shipped', 'delivered', 'canceled']
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' })
    const order = await Order.findById(id)
    if (!order) return res.status(404).json({ message: 'Order not found' })
    order.status = status
    order.statusHistory.push({ status, at: new Date() })
    order.audit.push({ type: 'status_update', at: new Date(), details: { status } })
    await order.save()
    const lean = await Order.findById(id).lean()
    return res.json({ order: lean })
  } catch (err) {
    next(err)
  }
}

async function setTracking(req, res, next) {
  try {
    const { id } = req.params
    const { trackingNumber } = req.body || {}
    if (!trackingNumber) return res.status(400).json({ message: 'trackingNumber is required' })
    const order = await Order.findById(id)
    if (!order) return res.status(404).json({ message: 'Order not found' })
    order.trackingNumber = trackingNumber
    order.audit.push({ type: 'tracking_set', at: new Date(), details: { trackingNumber } })
    await order.save()
    const lean = await Order.findById(id).lean()
    return res.json({ order: lean })
  } catch (err) {
    next(err)
  }
}

async function cancel(req, res, next) {
  try {
    const { id } = req.params
    const { reason } = req.body || {}
    const order = await Order.findById(id)
    if (!order) return res.status(404).json({ message: 'Order not found' })
    order.status = 'canceled'
    order.statusHistory.push({ status: 'canceled', at: new Date() })
    order.audit.push({ type: 'order_canceled', at: new Date(), details: { reason } })
    await order.save()
    const lean = await Order.findById(id).lean()
    return res.json({ order: lean })
  } catch (err) {
    next(err)
  }
}

async function getAudit(req, res, next) {
  try {
    const { id } = req.params
    const order = await Order.findById(id).lean()
    if (!order) return res.status(404).json({ message: 'Order not found' })
    return res.json({ audit: order.audit || [] })
  } catch (err) {
    next(err)
  }
}

module.exports = { listAll, setStatus, setTracking, cancel, getAudit }