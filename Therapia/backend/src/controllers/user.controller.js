const User = require('../models/user');
const mongoose = require('mongoose');

// POST /api/users
async function createUser(req, res, next) {
  try {
    const body = req.body || {};
    const user = await User.create(body);
    res.status(201).json({ user });
  } catch (err) {
    // handle duplicate key errors cleanly
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'User already exists', key: err.keyValue });
    }
    next(err);
  }
}

// PUT /api/users/:id
async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const update = req.body || {};
    const user = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

// GET /api/users
async function listUsers(req, res, next) {
  try {
    const users = await User.find({}).lean();
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

module.exports = { createUser, updateUser, listUsers };
// New: find user by email or phone for simple login
async function findUser(req, res, next) {
  try {
    const { email, phone } = req.query;
    if (!email && !phone) {
      return res.status(400).json({ message: 'Provide email or phone' });
    }
    const query = email ? { email } : { phone };
    const user = await User.findOne(query).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports.findUser = findUser;

// --- Cart handlers ---
// GET /api/users/:id/cart
async function getCart(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate('cart.product').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ cart: user.cart || [] });
  } catch (err) {
    next(err);
  }
}

// POST /api/users/:id/cart
// body: { productId, quantity }
async function addToCart(req, res, next) {
  try {
    const { id } = req.params;
    const { productId, quantity } = req.body || {};
    if (!productId) return res.status(400).json({ message: 'productId is required' });
    const qty = Math.max(1, Number(quantity || 1));

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const pid = new mongoose.Types.ObjectId(String(productId));
    const existing = user.cart.find(ci => String(ci.product) === String(pid));
    if (existing) {
      existing.quantity = (existing.quantity || 1) + qty;
    } else {
      user.cart.push({ product: pid, quantity: qty });
    }
    await user.save();
    const populated = await User.findById(id).populate('cart.product').lean();
    return res.status(201).json({ cart: populated.cart || [] });
  } catch (err) {
    next(err);
  }
}

// PUT /api/users/:id/cart/:itemId
// body: { quantity }
async function updateCartItem(req, res, next) {
  try {
    const { id, itemId } = req.params;
    const { quantity } = req.body || {};
    const qty = Math.max(1, Number(quantity || 1));
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const item = user.cart.id(itemId);
    if (!item) return res.status(404).json({ message: 'Cart item not found' });
    item.quantity = qty;
    await user.save();
    const populated = await User.findById(id).populate('cart.product').lean();
    return res.json({ cart: populated.cart || [] });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/users/:id/cart/:itemId
async function removeCartItem(req, res, next) {
  try {
    const { id, itemId } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Some mongoose versions/deprecations remove the subdocument .remove() method.
    // Use array filtering to remove the item robustly.
    const beforeLen = user.cart.length;
    user.cart = user.cart.filter(ci => String(ci._id) !== String(itemId));
    if (user.cart.length === beforeLen) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    await user.save();
    const populated = await User.findById(id).populate('cart.product').lean();
    return res.json({ cart: populated.cart || [] });
  } catch (err) {
    next(err);
  }
}

module.exports.getCart = getCart;
module.exports.addToCart = addToCart;
module.exports.updateCartItem = updateCartItem;
module.exports.removeCartItem = removeCartItem;