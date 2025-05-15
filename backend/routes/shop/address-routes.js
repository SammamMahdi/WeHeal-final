import express from 'express';
import Address from '../../models/address.model.js';
import { verifyToken } from '../../middleware/verifyToken.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get all addresses for the logged-in user
router.get('/', async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.userId }).sort({ isDefault: -1 });
    return res.status(200).json({ success: true, count: addresses.length, addresses });
  } catch (error) {
    console.error('Get addresses error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching addresses' });
  }
});

// Get a single address
router.get('/:id', async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.userId });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    return res.status(200).json({ success: true, address });
  } catch (error) {
    console.error('Get address error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching address' });
  }
});

// Create a new address
router.post('/', async (req, res) => {
  try {
    const { fullName, address: addressLine, city, postalCode, country, phoneNumber, isDefault } = req.body;
    const newAddress = new Address({ user: req.userId, fullName, address: addressLine, city, postalCode, country, phoneNumber, isDefault: isDefault || false });
    await newAddress.save();
    return res.status(201).json({ success: true, message: 'Address created successfully', address: newAddress });
  } catch (error) {
    console.error('Create address error:', error);
    return res.status(500).json({ success: false, message: 'Server error while creating address' });
  }
});

// Update an address
router.put('/:id', async (req, res) => {
  try {
    const { fullName, address: addressLine, city, postalCode, country, phoneNumber, isDefault } = req.body;
    const address = await Address.findOne({ _id: req.params.id, user: req.userId });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    if (fullName) address.fullName = fullName;
    if (addressLine) address.address = addressLine;
    if (city) address.city = city;
    if (postalCode) address.postalCode = postalCode;
    if (country) address.country = country;
    if (phoneNumber) address.phoneNumber = phoneNumber;
    if (isDefault !== undefined) address.isDefault = isDefault;
    await address.save();
    return res.status(200).json({ success: true, message: 'Address updated successfully', address });
  } catch (error) {
    console.error('Update address error:', error);
    return res.status(500).json({ success: false, message: 'Server error while updating address' });
  }
});

// Set an address as default
router.put('/:id/default', async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.userId });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    address.isDefault = true;
    await address.save();
    return res.status(200).json({ success: true, message: 'Address set as default', address });
  } catch (error) {
    console.error('Set default address error:', error);
    return res.status(500).json({ success: false, message: 'Server error while setting default address' });
  }
});

// Delete an address
router.delete('/:id', async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.userId });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    await address.deleteOne();
    return res.status(200).json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    return res.status(500).json({ success: false, message: 'Server error while deleting address' });
  }
});

export default router; 