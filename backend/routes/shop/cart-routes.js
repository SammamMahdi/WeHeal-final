import express from 'express';
import Cart from '../../models/cart.model.js';
import Product from '../../models/product.model.js';
import { verifyToken } from '../../middleware/verifyToken.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get user's cart
router.get('/', async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      cart = new Cart({ user: req.userId, items: [], totalPrice: 0, totalItems: 0 });
      await cart.save();
    }
    return res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching cart' });
  }
});

// Add item to cart
router.post('/add', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough stock available' });
    }
    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) cart = new Cart({ user: req.userId, items: [], totalPrice: 0, totalItems: 0 });
    const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, name: product.name, quantity: Number(quantity), price: product.discountPrice || product.price, imageUrl: product.imageUrl });
    }
    await cart.save();
    return res.status(200).json({ success: true, message: 'Item added to cart', cart });
  } catch (error) {
    console.error('Add to cart error:', error);
    return res.status(500).json({ success: false, message: 'Server error while adding to cart' });
  }
});

// Update cart item quantity
router.put('/update/:itemId', async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;
    if (!quantity || quantity < 1) return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) return res.status(404).json({ success: false, message: 'Item not found in cart' });
    const product = await Product.findById(cart.items[itemIndex].product);
    if (!product || product.stock < quantity) return res.status(400).json({ success: false, message: 'Not enough stock available' });
    cart.items[itemIndex].quantity = Number(quantity);
    await cart.save();
    return res.status(200).json({ success: true, message: 'Cart updated', cart });
  } catch (error) {
    console.error('Update cart error:', error);
    return res.status(500).json({ success: false, message: 'Server error while updating cart' });
  }
});

// Remove item from cart
router.delete('/remove/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();
    return res.status(200).json({ success: true, message: 'Item removed from cart', cart });
  } catch (error) {
    console.error('Remove from cart error:', error);
    return res.status(500).json({ success: false, message: 'Server error while removing from cart' });
  }
});

export default router; 