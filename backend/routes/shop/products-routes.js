import express from 'express';
import Product from '../../models/product.model.js';
import { verifyToken } from '../../middleware/verifyToken.js';
import { isAdmin } from '../../middleware/isAdmin.js';

const router = express.Router();

// Get all products (with optional filtering)
router.get('/', async (req, res) => {
  try {
    const { category, featured, sort, limit = 10, page = 1 } = req.query;
    const queryObject = {};
    if (category) {
      queryObject.category = category;
    }
    if (featured === 'true') {
      queryObject.featured = true;
    }
    const sortOptions = sort ? sort.split(',').join(' ') : '-createdAt';
    const skip = (Number(page) - 1) * Number(limit);
    const products = await Product.find(queryObject)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));
    const totalProducts = await Product.countDocuments(queryObject);
    const totalPages = Math.ceil(totalProducts / Number(limit));
    return res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      totalPages,
      currentPage: Number(page),
      products
    });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching products' });
  }
});

// Get all product categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching categories' });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    const featuredProducts = await Product.find({ featured: true })
      .sort('-createdAt')
      .limit(8);
    return res.status(200).json({ success: true, count: featuredProducts.length, products: featuredProducts });
  } catch (error) {
    console.error('Get featured products error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching featured products' });
  }
});

// Get a single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching product' });
  }
});

// Create a new product (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, description, price, discountPrice, category, imageUrl, stock, featured, weight, company } = req.body;
    const product = new Product({ name, description, price, discountPrice, category, imageUrl, stock, featured, weight, company });
    await product.save();
    return res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ success: false, message: 'Server error while creating product' });
  }
});

// Update a product (admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    // Update fields
    Object.assign(product, req.body);
    await product.save();
    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ success: false, message: 'Server error while updating product' });
  }
});

// Delete a product (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    await product.deleteOne();
    return res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ success: false, message: 'Server error while deleting product' });
  }
});

export default router; 