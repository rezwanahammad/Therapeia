const jwt = require('jsonwebtoken');

const TOKEN_COOKIE = 'access_token';

module.exports = function auth(req, res, next) {
  try {
    const token = req.cookies?.[TOKEN_COOKIE] || (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (e) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.userId = decoded.sub;
    req.userToken = decoded;
    next();
  } catch (err) {
    next(err);
  }
};