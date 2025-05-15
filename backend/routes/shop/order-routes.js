import express from 'express';
import Order from '../../models/order.model.js';
import { verifyToken } from '../../middleware/verifyToken.js';

const router = express.Router();

// Apply authentication middleware
router.use(verifyToken);

// Create an order
router.post('/', async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items provided' });
    }

    const order = new Order({
      user: req.userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice
    });

    const createdOrder = await order.save();
    return res.status(201).json({ success: true, order: createdOrder });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ success: false, message: 'Server error while creating order' });
  }
});

// Get current user's orders
router.get('/my-orders', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('Get user orders error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching orders' });
  }
});

// Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    // Ensure user owns the order or is admin?
    if (order.user._id.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }
    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching order' });
  }
});

export default router; 