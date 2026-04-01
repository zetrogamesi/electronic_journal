const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_in_prod';

/**
 * authenticate — verify JWT, attach decoded payload to req.user
 * (fast, no DB hit on every request)
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Токен авторизации отсутствует' });

  try {
    req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Недействительный или истёкший токен' });
  }
};

/**
 * adminOnly — checks isAdmin from DATABASE, not from the JWT.
 * This means admin rights granted via make-admin.js take effect
 * immediately, without requiring the user to log out and back in.
 */
const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('isAdmin').lean();
    if (!user || !user.isAdmin)
      return res.status(403).json({ error: 'Доступ запрещён. Требуются права администратора.' });
    // Sync the flag onto req.user so downstream handlers see the fresh value
    req.user.isAdmin = true;
    next();
  } catch (err) {
    console.error('adminOnly check error:', err);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

module.exports = { authenticate, adminOnly };
