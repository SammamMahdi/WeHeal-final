const LabTest = require('../models/LabTest');

// Add a new lab test
exports.addLabTest = async (req, res) => {
  try {
    const { name, price } = req.body;
    const newLabTest = new LabTest({ name, price });
    await newLabTest.save();
    res.status(201).json({ message: 'Lab test added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add lab test' });
  }
};

// Get all lab tests
exports.getAllLabTests = async (req, res) => {
  try {
    const labTests = await LabTest.find();
    res.status(200).json(labTests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve lab tests' });
  }
}; 