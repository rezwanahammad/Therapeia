const User = require('../models/user');

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