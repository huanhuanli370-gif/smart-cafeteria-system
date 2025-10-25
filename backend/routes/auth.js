// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authRequired } = require('../middlewares/auth');

const signToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRES || '7d' }
  );

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    // 检查邮箱是否重复
    const [existingUsers] = await req.db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ success: false, error: 'Email already in use' });
    }

    // 限制角色为 student / faculty
    const allowedRoles = ['student', 'faculty'];
    const assignedRole = allowedRoles.includes(role) ? role : 'student';

    // 哈希密码
    const hash = await bcrypt.hash(password, 10);

    // 插入新用户
    const [result] = await req.db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hash, assignedRole]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: result.insertId, name, email, role: assignedRole }
    });

  } catch (e) {
    console.error('Registration error:', e);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});


// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const [rows] = await req.db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const token = signToken(user);
    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', authRequired, (req, res) => {
  // if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  console.log('HIT /api/auth/me user=', req.user);
  res.json({ success: true, data: req.user });
});

// PUT /api/auth/me (update current user profile)
router.put('/me', authRequired, async (req, res) => {
  // if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

  try {
    const { name, email, phone } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email required' });
    }

    // 邮箱唯一性检查
    const [exists] = await req.db.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, req.user.id]
    );
    if (exists.length > 0) {
      return res.status(400).json({ success: false, error: 'Email already in use' });
    }

    await req.db.execute(
      'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
      [name, email, phone || null, req.user.id]
    );

    const updatedUser = { ...req.user, name, email, phone };
    res.json({ success: true, data: updatedUser });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: 'Update failed' });
  }
});

module.exports = router;
