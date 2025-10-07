const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/admin');

const TOKEN_COOKIE = 'admin_access_token';
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

// POST /api/admin/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await Admin.findOne({ email }).lean();
    if (existing) {
      return res.status(409).json({ message: 'Admin already exists' });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const doc = {
      name,
      email,
      role: role || 'admin',
      auth: { passwordHash, emailVerified: false },
    };

    const admin = await Admin.create(doc);
    const token = signToken({ sub: admin._id, email: admin.email, role: admin.role, typ: 'admin' });
    setAuthCookie(res, token);
    const safeAdmin = await Admin.findById(admin._id).lean();
    return res.status(201).json({ admin: safeAdmin });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const admin = await Admin.findOne({ email }).select('+auth.passwordHash').lean();
    if (!admin || !admin.auth || !admin.auth.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(String(password), admin.auth.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    // Update last login timestamp (non-blocking)
    Admin.updateOne({ _id: admin._id }, { $set: { lastLoginAt: new Date() } }).catch(() => {});

    const token = signToken({ sub: admin._id, email: admin.email, role: admin.role, typ: 'admin' });
    setAuthCookie(res, token);
    const safeAdmin = await Admin.findById(admin._id).lean();
    return res.json({ admin: safeAdmin });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/auth/logout
function logout(req, res) {
  res.clearCookie(TOKEN_COOKIE, { path: '/' });
  return res.json({ message: 'Logged out' });
}

// GET /api/admin/auth/me
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
    const admin = await Admin.findById(decoded.sub).lean();
    if (!admin) return res.status(401).json({ message: 'Unauthorized' });
    return res.json({ admin });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me };