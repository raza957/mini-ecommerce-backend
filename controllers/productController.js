const pool = require('../config/db');

// Get all products
const getProducts = async (req, res) => {
  try {
    const { category, featured, search, page = 1, limit = 10 } = req.query;
    
    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.active = true
    `;
    let countQuery = 'SELECT COUNT(*) FROM products p WHERE p.active = true';
    const queryParams = [];
    const countParams = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND p.category_id = $${paramCount}`;
      countQuery += ` AND p.category_id = $${paramCount}`;
      queryParams.push(category);
      countParams.push(category);
    }

    if (featured) {
      paramCount++;
      query += ` AND p.featured = $${paramCount}`;
      countQuery += ` AND p.featured = $${paramCount}`;
      queryParams.push(featured === 'true');
      countParams.push(featured === 'true');
    }

    if (search) {
      paramCount++;
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      countQuery += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit, 10), offset);

    const products = await pool.query(query, queryParams);
    const totalResult = await pool.query(countQuery, countParams);
    const total = parseInt(totalResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    res.json({
      products: products.rows,
      currentPage: parseInt(page),
      totalPages,
      totalProducts: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const product = await pool.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = $1 AND p.active = true`,
      [req.params.id]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create product (Admin only)
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      original_price,
      category_id,
      stock_quantity,
      featured,
    } = req.body;

    const product = await pool.query(
      `INSERT INTO products 
       (name, description, price, original_price, category_id, stock_quantity, featured) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [name, description, price, original_price, category_id, stock_quantity, featured]
    );

    res.status(201).json(product.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update product (Admin only)
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      original_price,
      category_id,
      stock_quantity,
      featured,
      active,
    } = req.body;

    const product = await pool.query(
      `UPDATE products 
       SET name = $1, description = $2, price = $3, original_price = $4, 
           category_id = $5, stock_quantity = $6, featured = $7, active = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 
       RETURNING *`,
      [name, description, price, original_price, category_id, stock_quantity, featured, active, req.params.id]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
};