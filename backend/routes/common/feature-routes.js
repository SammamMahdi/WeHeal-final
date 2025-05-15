import express from 'express';
import Feature from '../../models/feature.model.js';
import { verifyToken } from '../../middleware/verifyToken.js';
import { isAdmin } from '../../middleware/isAdmin.js';

const router = express.Router();

// Get all active features (public)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const query = { isActive: true };
    if (type) query.type = type;
    const features = await Feature.find(query).sort({ displayOrder: 1 });
    return res.status(200).json({ success: true, count: features.length, features });
  } catch (error) {
    console.error('Get features error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching features' });
  }
});

// Admin routes
router.use(verifyToken, isAdmin);

// Get all features (including inactive) - admin only
router.get('/admin', async (req, res) => {
  try {
    const features = await Feature.find().sort({ displayOrder: 1 });
    return res.status(200).json({ success: true, count: features.length, features });
  } catch (error) {
    console.error('Get all features error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching all features' });
  }
});

// Create a new feature
router.post('/', async (req, res) => {
  try {
    const { title, description, imageUrl, linkUrl, type, isActive, displayOrder } = req.body;
    const feature = new Feature({ title, description, imageUrl, linkUrl, type, isActive: isActive !== undefined ? isActive : true, displayOrder: displayOrder || 0 });
    await feature.save();
    return res.status(201).json({ success: true, message: 'Feature created successfully', feature });
  } catch (error) {
    console.error('Create feature error:', error);
    return res.status(500).json({ success: false, message: 'Server error while creating feature' });
  }
});

// Update a feature
router.put('/:id', async (req, res) => {
  try {
    const { title, description, imageUrl, linkUrl, type, isActive, displayOrder } = req.body;
    const feature = await Feature.findById(req.params.id);
    if (!feature) return res.status(404).json({ success: false, message: 'Feature not found' });
    if (title) feature.title = title;
    if (description) feature.description = description;
    if (imageUrl) feature.imageUrl = imageUrl;
    if (linkUrl) feature.linkUrl = linkUrl;
    if (type) feature.type = type;
    if (isActive !== undefined) feature.isActive = isActive;
    if (displayOrder !== undefined) feature.displayOrder = displayOrder;
    await feature.save();
    return res.status(200).json({ success: true, message: 'Feature updated successfully', feature });
  } catch (error) {
    console.error('Update feature error:', error);
    return res.status(500).json({ success: false, message: 'Server error while updating feature' });
  }
});

// Delete a feature
router.delete('/:id', async (req, res) => {
  try {
    const feature = await Feature.findById(req.params.id);
    if (!feature) return res.status(404).json({ success: false, message: 'Feature not found' });
    await feature.deleteOne();
    return res.status(200).json({ success: true, message: 'Feature deleted successfully' });
  } catch (error) {
    console.error('Delete feature error:', error);
    return res.status(500).json({ success: false, message: 'Server error while deleting feature' });
  }
});

export default router; 