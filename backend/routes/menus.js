const express = require('express');
const router = express.Router();
const { authRequired, requireRole } = require('../middlewares/auth');


// GET /api/menus
// Publicly accessible, supports fuzzy search with ?q=
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    let rows;

    if (q) {
      [rows] = await req.db.execute(
        'SELECT * FROM menus WHERE name LIKE ? OR description LIKE ?',
        [`%${q}%`, `%${q}%`]
      );
    } else {
      [rows] = await req.db.execute('SELECT * FROM menus ORDER BY id ASC');
    }

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('❌ GET /menus error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch menus' });
  }
});

// GET /api/menus/recommendations
// Protected route for personalized recommendations.
router.get('/recommendations', authRequired, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Step 1: Find the user's most frequently ordered category
        const [categoryRows] = await req.db.execute(`
            SELECT m.category
            FROM orders o
            JOIN JSON_TABLE(o.items, '$[*]' COLUMNS (id INT PATH '$.id')) AS jt
            JOIN menus m ON m.id = jt.id
            WHERE o.customer_id = ?
            GROUP BY m.category
            ORDER BY COUNT(*) DESC
            LIMIT 1;
        `, [userId]);

        let recommendations = [];
        let favoriteCategory = categoryRows.length > 0 ? categoryRows[0].category : null;

        if (favoriteCategory) {
            // Step 2: Find dishes in that category that the user has NOT ordered before
            const [recs] = await req.db.execute(`
                SELECT * FROM menus
                WHERE category = ?
                AND id NOT IN (
                    SELECT jt.id
                    FROM orders o
                    JOIN JSON_TABLE(o.items, '$[*]' COLUMNS (id INT PATH '$.id')) AS jt
                    WHERE o.customer_id = ?
                )
                ORDER BY RAND() -- Randomize the suggestions
                LIMIT 5;
            `, [favoriteCategory, userId]);
            recommendations = recs;
        }

        // Step 3 (Fallback): If no recommendations are found, provide random popular dishes
        if (recommendations.length === 0) {
            const [fallbackRecs] = await req.db.execute(`
                SELECT * FROM menus ORDER BY RAND() LIMIT 5
            `);
            recommendations = fallbackRecs;
        }

        res.json({ success: true, data: recommendations });

    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch recommendations' });
    }
});


// GET /api/menus/trending
// Publicly accessible, returns top 5 most ordered dishes
router.get('/trending', async (req, res) => {
    try {
        // This query flattens all items from all orders, groups by menu item, and counts occurrences
        const [rows] = await req.db.execute(`
            SELECT m.*, COUNT(jt.id) as order_count
            FROM orders o
            JOIN JSON_TABLE(o.items, '$[*]' COLUMNS (id INT PATH '$.id')) as jt
            JOIN menus m ON m.id = jt.id
            GROUP BY m.id
            ORDER BY order_count DESC
            LIMIT 5;
        `);

        // Fallback: If no orders exist yet, return 5 random menu items
        if (rows.length === 0) {
            const [fallbackRows] = await req.db.execute(`
                SELECT * FROM menus ORDER BY RAND() LIMIT 5
            `);
             return res.json({ success: true, data: fallbackRows });
        }

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching trending dishes:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch trending dishes' });
    }
});

// GET /api/menus/reorder
// Protected route, returns items the user has ordered before
router.get('/reorder', authRequired, async (req, res) => {
    try {
        const userId = req.user.id;

        // ======================= DEBUG LOGGING START =======================
        console.log(`[DEBUG] User ID for /reorder: ${userId}`);

        const [orders] = await req.db.execute('SELECT items FROM orders WHERE customer_id = ?', [userId]);
        console.log(`[DEBUG] Found ${orders.length} orders for this user.`);

        if (orders.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const allItems = orders.flatMap(o => JSON.parse(o.items || '[]'));
        console.log(`[DEBUG] Total items parsed from orders: ${allItems.length}`);

        const orderedDishIds = [...new Set(
            allItems
                .map(item => item.id)
                .filter(id => id != null) // Ensure no null/undefined IDs
        )];
        console.log(`[DEBUG] Unique dish IDs to reorder:`, orderedDishIds);
        // ======================= DEBUG LOGGING END =======================


        if (orderedDishIds.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const placeholders = orderedDishIds.map(() => '?').join(',');
        const [rows] = await req.db.execute(
            `SELECT * FROM menus WHERE id IN (${placeholders})`,
            orderedDishIds
        );
        
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching reorder dishes:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch reorder dishes' });
    }
});


// POST /api/menus
// Protected route, admin only
router.post('/', authRequired, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const { name, description, price, image } = req.body;
    if (!name || price === undefined || isNaN(price)) {
      return res.status(400).json({ success: false, error: 'Name and valid price are required' });
    }
    const [result] = await req.db.execute(
      'INSERT INTO menus (name, description, price, image) VALUES (?, ?, ?, ?)',
      [name, description || '', parseFloat(price), image || '']
    );
    res.status(201).json({
      success: true,
      data: { id: result.insertId, name, description: description || '', price: parseFloat(price), image: image || '' }
    });
  } catch (err) {
    console.error('❌ POST /menus error:', err);
    res.status(500).json({ success: false, error: 'Failed to add menu' });
  }
});

// PUT /api/menus/:id
// Protected route, admin only
router.put('/:id', authRequired, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image } = req.body;
    if (!name || price === undefined || isNaN(price)) {
      return res.status(400).json({ success: false, error: 'Name and valid price are required' });
    }
    const [result] = await req.db.execute(
      'UPDATE menus SET name = ?, description = ?, price = ?, image = ? WHERE id = ?',
      [name, description || '', parseFloat(price), image || '', id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    res.json({
      success: true,
      data: { id, name, description: description || '', price: parseFloat(price), image: image || '' }
    });
  } catch (err) {
    console.error('❌ PUT /menus/:id error:', err);
    res.status(500).json({ success: false, error: 'Failed to update menu' });
  }
});

// DELETE /api/menus/:id
// Protected route, admin only
router.delete('/:id', authRequired, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await req.db.execute('DELETE FROM menus WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    res.json({ success: true, id });
  } catch (err) {
    console.error('❌ DELETE /menus/:id error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete menu' });
  }
});

module.exports = router;

