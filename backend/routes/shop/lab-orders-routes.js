import express from 'express';
import LabTestOrder from '../../models/labTestOrder.model.js';
import LabTest from '../../models/labTest.model.js';
import { verifyToken } from '../../middleware/verifyToken.js';

const router = express.Router();

// Apply authentication middleware
router.use(verifyToken);

// Place a new lab test order
router.post('/', async (req, res) => {
  try {
    const { patientInfo, selectedTests, selectedLab, appointmentDetails } = req.body;
    if (!patientInfo || !selectedTests || !selectedLab || !appointmentDetails) {
      return res.status(400).json({ success: false, message: 'Missing required order information' });
    }
    const testIds = selectedTests.map(test => test.testId);
    const tests = await LabTest.find({ _id: { $in: testIds } });
    if (tests.length !== testIds.length) {
      return res.status(400).json({ success: false, message: 'One or more selected tests are invalid' });
    }
    let totalAmount = 0;
    const orderTests = tests.map(test => {
      const price = test.discountPrice || test.price;
      totalAmount += price;
      return { test: test._id, price };
    });
    if (appointmentDetails.isHomeCollection) {
      if (tests[0].isHomeCollection) {
        totalAmount += tests[0].homeCollectionFee;
      } else {
        return res.status(400).json({ success: false, message: 'Home collection is not available for the selected test(s)' });
      }
    }
    const newOrder = new LabTestOrder({
      user: req.userId,
      patientInfo,
      selectedTests: orderTests,
      selectedLab,
      appointmentDetails,
      totalAmount,
      status: 'Pending',
      paymentStatus: 'Pending'
    });
    await newOrder.save();
    return res.status(201).json({ success: true, message: 'Lab test order placed successfully', order: newOrder });
  } catch (error) {
    console.error('Error placing lab test order:', error);
    return res.status(500).json({ success: false, message: 'Server error while placing lab test order' });
  }
});

// Get all orders for the current user (with pagination)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const query = { user: req.userId };
    if (status) query.status = status;
    const orders = await LabTestOrder.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate({ path: 'selectedTests.test', select: 'testName category testCode' });
    const totalOrders = await LabTestOrder.countDocuments(query);
    return res.status(200).json({
      success: true,
      count: orders.length,
      total: totalOrders,
      totalPages: Math.ceil(totalOrders / limitNum),
      currentPage: pageNum,
      orders
    });
  } catch (error) {
    console.error('Error fetching lab test orders:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching lab test orders' });
  }
});

// Get a single order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await LabTestOrder.findOne({ _id: req.params.id, user: req.userId })
      .populate({ path: 'selectedTests.test', select: 'testName category description preparationInstructions sampleType turnAroundTime' });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Error fetching lab test order:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching lab test order details' });
  }
});

// Cancel an order (only if status is Pending)
router.put('/:id/cancel', async (req, res) => {
  try {
    const order = await LabTestOrder.findOne({ _id: req.params.id, user: req.userId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Only pending orders can be cancelled' });
    }
    order.status = 'Cancelled';
    await order.save();
    return res.status(200).json({ success: true, message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Error cancelling lab test order:', error);
    return res.status(500).json({ success: false, message: 'Server error while cancelling lab test order' });
  }
});

export default router; 