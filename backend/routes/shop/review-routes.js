import express from 'express';
import Review from '../../models/review.model.js';
import Product from '../../models/product.model.js';
import { verifyToken } from '../../middleware/verifyToken.js';

const router = express.Router();

// Get all reviews for a specific product (public)
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ success: false, message: 'Error fetching reviews' });
  }
});

// Add a new review - requires authentication
router.post('/', verifyToken, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.userId;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const existingReview = await Review.findOne({ user: userId, product: productId });
    if (existingReview) return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    const review = new Review({ user: userId, product: productId, rating, comment });
    await review.save();
    return res.status(201).json({ success: true, message: 'Review added successfully', review });
  } catch (error) {
    console.error('Error adding review:', error);
    return res.status(500).json({ success: false, message: 'Error adding review' });
  }
});

// Update a review - requires authentication
router.put('/:reviewId', verifyToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.userId;
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.user.toString() !== userId) return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();
    return res.status(200).json({ success: true, message: 'Review updated successfully', review });
  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({ success: false, message: 'Error updating review' });
  }
});

// Delete a review - requires authentication
router.delete('/:reviewId', verifyToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.userId;
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.user.toString() !== userId) return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    await Review.findByIdAndDelete(reviewId);
    return res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({ success: false, message: 'Error deleting review' });
  }
});

// Get all reviews by current user
router.get('/my-reviews', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const reviews = await Review.find({ user: userId })
      .populate('product', 'name imageUrl')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return res.status(500).json({ success: false, message: 'Error fetching user reviews' });
  }
});

export default router; 