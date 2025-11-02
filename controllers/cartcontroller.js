const pool = require('../config/db');

// Get user's cart
const getCart = async (req, res) => {
  try {
    console.log('Fetching cart for user:', req.user.id);
    
    const cart = await pool.query(
      `SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.image, p.stock_quantity
       FROM cart c
       JOIN cart_items ci ON c.id = ci.cart_id
       JOIN products p ON ci.product_id = p.id
       WHERE c.user_id = $1`,
      [req.user.id]
    );

    console.log('Cart items found:', cart.rows.length);
    res.json(cart.rows);
  } catch (error) {
    console.error('Error in getCart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    console.log('Adding to cart:', { productId, quantity, userId: req.user.id });

    // Get user's cart
    const cart = await pool.query(
      'SELECT id FROM cart WHERE user_id = $1',
      [req.user.id]
    );

    let cartId;
    if (cart.rows.length === 0) {
      // Create cart if doesn't exist
      const newCart = await pool.query(
        'INSERT INTO cart (user_id) VALUES ($1) RETURNING id',
        [req.user.id]
      );
      cartId = newCart.rows[0].id;
      console.log('New cart created:', cartId);
    } else {
      cartId = cart.rows[0].id;
      console.log('Existing cart found:', cartId);
    }

    // Check if item already in cart
    const existingItem = await pool.query(
      'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, productId]
    );

    if (existingItem.rows.length > 0) {
      // Update quantity if item exists
      await pool.query(
        'UPDATE cart_items SET quantity = quantity + $1 WHERE cart_id = $2 AND product_id = $3',
        [quantity, cartId, productId]
      );
      console.log('Item quantity updated');
    } else {
      // Add new item to cart
      await pool.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
        [cartId, productId, quantity]
      );
      console.log('New item added to cart');
    }

    res.json({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error('Error in addToCart:', error);
    res.status(500).json({ message: 'Failed to add item to cart' });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    console.log('Updating cart item:', { itemId, quantity });

    const result = await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
      [quantity, itemId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Error in updateCartItem:', error);
    res.status(500).json({ message: 'Failed to update cart' });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    console.log('Removing cart item:', itemId);

    const result = await pool.query(
      'DELETE FROM cart_items WHERE id = $1 RETURNING *',
      [itemId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Error in removeFromCart:', error);
    res.status(500).json({ message: 'Failed to remove item from cart' });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const cart = await pool.query(
      'SELECT id FROM cart WHERE user_id = $1',
      [req.user.id]
    );

    if (cart.rows.length > 0) {
      await pool.query(
        'DELETE FROM cart_items WHERE cart_id = $1',
        [cart.rows[0].id]
      );
      console.log('Cart cleared for user:', req.user.id);
    }

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error in clearCart:', error);
    res.status(500).json({ message: 'Failed to clear cart' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};