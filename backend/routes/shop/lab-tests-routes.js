import express from 'express';
import LabTest from '../../models/labTest.model.js';

const router = express.Router();

// Get all lab tests (with optional filtering and pagination)
router.get('/', async (req, res) => {
  try {
    const {
      category,
      priceMin,
      priceMax,
      search,
      isHomeCollection,
      page = 1,
      limit = 10,
      sort = 'testName'
    } = req.query;

    const query = { isActive: true };
    if (category) query.category = category;
    if (priceMin !== undefined || priceMax !== undefined) {
      query.price = {};
      if (priceMin !== undefined) query.price.$gte = Number(priceMin);
      if (priceMax !== undefined) query.price.$lte = Number(priceMax);
    }
    if (isHomeCollection !== undefined) query.isHomeCollection = isHomeCollection === 'true';
    if (search) query.$text = { $search: search };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortOption = {};
    if (sort.startsWith('-')) sortOption[sort.substring(1)] = -1;
    else sortOption[sort] = 1;

    const tests = await LabTest.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);
    const totalTests = await LabTest.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: tests.length,
      total: totalTests,
      totalPages: Math.ceil(totalTests / limitNum),
      currentPage: pageNum,
      tests
    });
  } catch (error) {
    console.error('Error fetching lab tests:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching lab tests' });
  }
});

// Get lab test categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await LabTest.distinct('category');
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching test categories:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching test categories' });
  }
});

// Get a single lab test by ID
router.get('/:id', async (req, res) => {
  try {
    const test = await LabTest.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Lab test not found' });
    return res.status(200).json({ success: true, test });
  } catch (error) {
    console.error('Error fetching lab test:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching lab test details' });
  }
});

// Get available labs for a specific test
router.get('/:id/labs', async (req, res) => {
  try {
    const test = await LabTest.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Lab test not found' });
    return res.status(200).json({ success: true, labs: test.availableLabs });
  } catch (error) {
    console.error('Error fetching available labs:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching available labs' });
  }
});

// Get available time slots for a test at a specific lab
router.get('/:id/labs/:labName/slots', async (req, res) => {
  try {
    const { id, labName } = req.params;
    const { date } = req.query;
    const test = await LabTest.findById(id);
    if (!test) return res.status(404).json({ success: false, message: 'Lab test not found' });
    const lab = test.availableLabs.find(l => l.labName === labName);
    if (!lab) return res.status(404).json({ success: false, message: 'Lab not found for this test' });
    let availableSlots = lab.availableSlots;
    if (date) {
      const selectedDate = new Date(date);
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const dayOfWeek = days[selectedDate.getDay()];
      availableSlots = availableSlots.filter(s => s.day === dayOfWeek);
    }
    return res.status(200).json({ success: true, labName: lab.labName, location: lab.location, availableSlots });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching available slots' });
  }
});

export default router; 