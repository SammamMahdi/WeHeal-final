const Medicine = require('../models/Medicine');

// Add a new medicine
exports.addMedicine = async (req, res) => {
  try {
    const { name, price } = req.body;
    const newMedicine = new Medicine({ name, price });
    await newMedicine.save();
    res.status(201).json({ message: 'Medicine added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add medicine' });
  }
};

// Get all medicines
exports.getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.status(200).json(medicines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve medicines' });
  }
}; 