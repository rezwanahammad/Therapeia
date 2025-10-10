const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Order = require('../models/order')
const User = require('../models/user')

const TOKEN_COOKIE = 'access_token'

function getAuthUserId(req) {
  const token = req.cookies?.[TOKEN_COOKIE] || (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) return null
  try {
    const secret = process.env.JWT_SECRET || 'dev-secret-change-me'
    const dec = jwt.verify(token, secret)
    return dec?.sub || null
  } catch {
    return null
  }
}

// POST /api/orders
async function createOrder(req, res, next) {
  try {
    const uid = getAuthUserId(req)
    if (!uid) return res.status(401).json({ message: 'Unauthorized' })

    const user = await User.findById(uid).populate('cart.product')
    if (!user) return res.status(404).json({ message: 'User not found' })

    const cart = Array.isArray(user.cart) ? user.cart : []
    if (cart.length === 0) return res.status(400).json({ message: 'Cart is empty' })

    const items = cart.map(ci => {
      const price = Number(ci.product?.price ?? ci.priceAtAdd ?? 0)
      const qty = Math.max(1, Number(ci.quantity || 1))
      return {
        product: ci.product?._id || new mongoose.Types.ObjectId(String(ci.product)),
        name: ci.product?.name || 'Item',
        price,
        quantity: qty,
        lineTotal: price * qty,
      }
    })

    const totalAmount = items.reduce((sum, it) => sum + Number(it.lineTotal || 0), 0)

    const addresses = Array.isArray(user.addresses) ? user.addresses : []
    let def = addresses.find(a => a?.isDefault) || addresses[0]
    const shippingAddress = def ? {
      label: def.label || 'home',
      line1: def.line1,
      line2: def.line2 || '',
      city: def.city,
      state: def.state || '',
      postalCode: def.postalCode || '',
      country: def.country || 'Bangladesh',
    } : undefined

    const paymentMethod = req.body?.paymentMethod || 'Unknown'

    const order = await Order.create({
      user: user._id,
      items,
      totalAmount,
      status: 'placed',
      paymentStatus: 'completed',
      paymentMethod,
      shippingAddress,
      statusHistory: [{ status: 'placed', at: new Date() }],
      audit: [{ type: 'order_created', at: new Date(), details: { paymentMethod, totalAmount } }],
    })

    user.cart = []
    await user.save()

    return res.status(201).json({ order })
  } catch (err) {
    next(err)
  }
}

// GET /api/orders
async function listMyOrders(req, res, next) {
  try {
    const uid = getAuthUserId(req)
    if (!uid) return res.status(401).json({ message: 'Unauthorized' })
    const orders = await Order.find({ user: uid }).sort({ createdAt: -1 }).lean()
    return res.json({ orders })
  } catch (err) {
    next(err)
  }
}

// GET /api/orders/:id
async function getOrderById(req, res, next) {
  try {
    const uid = getAuthUserId(req)
    if (!uid) return res.status(401).json({ message: 'Unauthorized' })
    const { id } = req.params
    const order = await Order.findById(id).lean()
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (String(order.user) !== String(uid)) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    return res.json({ order })
  } catch (err) {
    next(err)
  }
}

module.exports = { createOrder, listMyOrders, getOrderById }