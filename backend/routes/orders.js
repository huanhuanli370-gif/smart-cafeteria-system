// backend/routes/orders.js
const express = require('express');
const router = express.Router();
const { authRequired, requireRole } = require('../middlewares/auth');

/**
 * POST /api/orders
 * 角色：student / faculty
 * 逻辑：创建订单 -> 如果是 student 则计算 20% 折扣 -> 广播给厨房
 */
router.post('/', authRequired, requireRole('student', 'faculty'), async (req, res) => {
  try {
    const { items } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Items required' });
    }
        
    // 1. 计算原始总价
    const original_price = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
    
    let discount_amount = 0;
    let final_price = original_price;
    const DISCOUNT_RATE = 0.20; // 20% discount for students

    // 2. 检查用户角色并应用折扣
    if (req.user?.role === 'student') {
      discount_amount = original_price * DISCOUNT_RATE;
      final_price = original_price - discount_amount;
    }

    const itemsStr = JSON.stringify(items);
    const name = req.user?.name || 'Guest';
    const userId = req.user?.id || null;

    const [result] = await req.db.execute(
      // 3. 将价格信息存入数据库
      'INSERT INTO orders (items, status, customer_id, customer_name, original_price, discount_amount, final_price) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [itemsStr, 'preparing', userId, name, original_price, discount_amount, final_price]
    );

    const data = {
      id: result.insertId,
      items,
      status: 'preparing',
      customer_id: userId,
      customer_name: name,
      original_price: original_price.toFixed(2),
      discount_amount: discount_amount.toFixed(2),
      final_price: final_price.toFixed(2),
    };

    // 🔊 广播给厨房（列表刷新用）
    req.io.emit('new_order', data);

    // 4. 将包含价格的完整订单信息返回给前端
    return res.status(201).json({ success: true, data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, error: 'Failed to create order' });
  }
});


/**
 * GET /api/orders
 * 角色：staff / admin
 * 可选查询：?status=preparing|completed
 */
router.get('/', authRequired, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const { status } = req.query || {};
    let sql = 'SELECT * FROM orders';
    const params = [];
    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }
    sql += ' ORDER BY id DESC';

    const [rows] = await req.db.execute(sql, params);
    const data = rows.map((r) => ({ ...r, items: JSON.parse(r.items || '[]') }));
    return res.json({ success: true, data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

/**
 * GET /api/orders/mine
 * 角色：student / faculty
 * 查询自己的历史订单
 */
router.get('/mine', authRequired, requireRole('student', 'faculty'), async (req, res) => {
  try {
    const [rows] = await req.db.execute(
      'SELECT * FROM orders WHERE customer_id = ? ORDER BY id DESC',
      [req.user.id]
    );
    const data = rows.map((r) => ({ ...r, items: JSON.parse(r.items || '[]') }));
    return res.json({ success: true, data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, error: 'Failed to fetch my orders' });
  }
});

/**
 * GET /api/orders/:id
 * 角色：staff / admin 可看任何订单；
 * student / faculty 只能看自己的订单
 * 用途：OrderStatusPage 首次进入时拉当前状态
 * 当 staff 首次查看时，触发 order_read 事件
 */
router.get('/:id', authRequired, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await req.db.execute('SELECT * FROM orders WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const order = rows[0];
    // 角色与所有权校验
    const role = req.user?.role;
    const isStaffOrAdmin = role === 'staff' || role === 'admin';
    const isOwner = Number(order.customer_id) === Number(req.user?.id);

    if (!isStaffOrAdmin && !isOwner) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    
    // 如果是后厨人员，并且这是第一次查看该订单
    if (isStaffOrAdmin && !order.is_viewed) {
      // 1. 标记为已读
      await req.db.execute('UPDATE orders SET is_viewed = TRUE WHERE id = ?', [id]);
      
      // 2. 发送全局通知，让前端根据 customerId 判断是否是自己的订单
      req.io.emit('order_read', { 
        orderId: Number(id), 
        customerId: order.customer_id 
      });
    }

    const data = { ...order, items: JSON.parse(order.items || '[]') };
    return res.json({ success: true, data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
});

/**
 * PUT /api/orders/:id/complete
 * 角色：staff / admin
 * 逻辑：更新状态 -> 广播厨房(order_completed) -> 精准推送订单房间(order_updated)
 */
router.put('/:id/complete', authRequired, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const [r] = await req.db.execute('UPDATE orders SET status = ? WHERE id = ?', [
      'completed',
      id,
    ]);
    if (r.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const payload = { id: Number(id), status: 'completed' };

    // 🔊 广播给厨房（列表从 preparing 里剔除）
    req.io.emit('order_completed', Number(id));
    // 🎯 精准推送状态页
    req.io.to(`order:${id}`).emit('order_updated', payload);

    return res.json({ success: true, data: payload });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, error: 'Failed to complete order' });
  }
});

module.exports = router;
