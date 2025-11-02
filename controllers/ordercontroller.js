const pool = require('../config/db');

// Create order
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod } = req.body;

    // Create order
    const order = await pool.query(
      `INSERT INTO orders (user_id, total_amount, shipping_address, payment_method) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, totalAmount, shippingAddress, paymentMethod]
    );

    // Add order items
    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) 
         VALUES ($1, $2, $3, $4)`,
        [order.rows[0].id, item.product_id, item.quantity, item.price]
      );
    }

    // Clear user's cart
    const cart = await pool.query(
      'SELECT id FROM cart WHERE user_id = $1',
      [req.user.id]
    );

    if (cart.rows.length > 0) {
      await pool.query(
        'DELETE FROM cart_items WHERE cart_id = $1',
        [cart.rows[0].id]
      );
    }

    res.status(201).json(order.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's orders
const getOrders = async (req, res) => {
  try {
    const orders = await pool.query(
      `SELECT o.*, 
              json_agg(
                json_build_object(
                  'product_id', oi.product_id,
                  'name', p.name,
                  'quantity', oi.quantity,
                  'price', oi.price
                )
              ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    res.json(orders.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single order
const getOrderById = async (req, res) => {
  try {
    const order = await pool.query(
      `SELECT o.*, 
              json_agg(
                json_build_object(
                  'product_id', oi.product_id,
                  'name', p.name,
                  'image', p.image,
                  'quantity', oi.quantity,
                  'price', oi.price
                )
              ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.id = $1 AND o.user_id = $2
       GROUP BY o.id`,
      [req.params.id, req.user.id]
    );

    if (order.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status (Admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (order.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
};