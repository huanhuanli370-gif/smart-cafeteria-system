const jwt = require('jsonwebtoken');

async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // 从数据库取最新用户
    const [rows] = await req.db.execute(
      'SELECT id, name, email, phone, role FROM users WHERE id = ?',
      [payload.id]
    );
    if (rows.length === 0) return res.status(401).json({ success: false, error: 'Unauthorized' });

    req.user = rows[0];
    next();
  } catch (e) {
    console.error('authRequired error:', e.message);
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ success: false, error: 'Forbidden' });
    next();
  };
}

module.exports = { authRequired, requireRole };
