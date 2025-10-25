const express = require('express');
const router = express.Router();
const { authRequired, requireRole } = require('../middlewares/auth');

// GET /api/statistics/summary
// Protected route, accessible only by admins.
router.get('/summary', authRequired, requireRole('admin', 'staff'), async (req, res) => {
  try {
    // 1. Get total revenue and order count
    const [generalStats] = await req.db.execute(
      'SELECT COUNT(*) as total_orders, SUM(final_price) as total_revenue FROM orders'
    );

    // 2. Get top 5 best-selling menu items by quantity
    const [top_selling_items] = await req.db.execute(`
        SELECT m.name, COUNT(jt.id) as order_count
        FROM orders o
        JOIN JSON_TABLE(o.items, '$[*]' COLUMNS (id INT PATH '$.id')) as jt
        JOIN menus m ON m.id = jt.id
        GROUP BY m.id
        ORDER BY order_count DESC
        LIMIT 5;
    `);

    // 3. Get daily revenue for the last 7 days
    const [daily_sales] = await req.db.execute(`
        SELECT
            DATE_FORMAT(created_at, '%Y-%m-%d') as sale_date,
            SUM(final_price) as daily_revenue
        FROM orders
        WHERE created_at >= CURDATE() - INTERVAL 6 DAY
        GROUP BY sale_date -- CORRECTED: Group by the alias used in the SELECT statement
        ORDER BY sale_date ASC;
    `);

    res.json({
      success: true,
      data: {
        total_revenue: generalStats[0].total_revenue || 0,
        total_orders: generalStats[0].total_orders || 0,
        top_selling_items,
        daily_sales,
      },
    });
  } catch (error) {
    console.error('Error fetching statistics summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

module.exports = router;

