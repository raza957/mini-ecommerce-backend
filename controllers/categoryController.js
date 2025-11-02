const pool = require('../config/db');

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(categories.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single category
const getCategoryById = async (req, res) => {
  try {
    const category = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [req.params.id]
    );

    if (category.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create category (Admin only)
const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const category = await pool.query(
      'INSERT INTO categories (name, description, image) VALUES ($1, $2, $3) RETURNING *',
      [name, description, image]
    );

    res.status(201).json(category.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update category (Admin only)
const updateCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const category = await pool.query(
      'UPDATE categories SET name = $1, description = $2, image = $3 WHERE id = $4 RETURNING *',
      [name, description, image, req.params.id]
    );

    if (category.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
};