const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const TOKEN_COOKIE = 'access_token';
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function signToken(payload) {
  const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
  return jwt.sign(payload, secret, { expiresIn: TOKEN_TTL_SECONDS });
}

function verifyToken(token) {
  const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
  return jwt.verify(token, secret);
}

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: TOKEN_TTL_SECONDS * 1000,
    path: '/',
  });
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      gender,
      dateOfBirth,
      address,
    } = req.body || {};

    if (!email || !phone || !firstName || !lastName || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const doc = {
      firstName,
      lastName,
      email,
      phone,
      gender: gender || 'prefer_not_say',
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      addresses: address ? [{ ...address, label: 'home', isDefault: true }] : [],
      auth: { passwordHash, emailVerified: false },
    };

    const user = await User.create(doc);
    const token = signToken({ sub: user._id, email: user.email });
    setAuthCookie(res, token);
    const safeUser = await User.findById(user._id).lean();
    return res.status(201).json({ user: safeUser });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email }).select('+auth.passwordHash').lean();
    if (!user || !user.auth || !user.auth.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(String(password), user.auth.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ sub: user._id, email: user.email });
    setAuthCookie(res, token);
    const safeUser = await User.findById(user._id).lean();
    return res.json({ user: safeUser });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout
function logout(req, res) {
  res.clearCookie(TOKEN_COOKIE, { path: '/' });
  return res.json({ message: 'Logged out' });
}

// GET /api/auth/me
async function me(req, res, next) {
  try {
    const token = req.cookies?.[TOKEN_COOKIE] || (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await User.findById(decoded.sub).lean();
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    return res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me };