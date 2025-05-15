import express from 'express';
import Product from '../../models/product.model.js';

const router = express.Router();

// Search products
router.get('/', async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, sort, limit = 10, page = 1 } = req.query;
    const queryObject = {};
    if (q) {
      queryObject.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ];
    }
    if (category) {
      queryObject.category = category;
    }
    if (minPrice || maxPrice) {
      queryObject.price = {};
      if (minPrice) queryObject.price.$gte = Number(minPrice);
      if (maxPrice) queryObject.price.$lte = Number(maxPrice);
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
    console.error('Search error:', error);
    return res.status(500).json({ success: false, message: 'Server error while searching products' });
  }
});

// Get search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.status(200).json({ success: true, suggestions: [] });
    }
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ]
    })
      .select('name category')
      .limit(10);
    const suggestions = products.map(product => ({ id: product._id, text: product.name, category: product.category }));
    return res.status(200).json({ success: true, suggestions });
  } catch (error) {
    console.error('Search suggestions error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching search suggestions' });
  }
});

export default router; 