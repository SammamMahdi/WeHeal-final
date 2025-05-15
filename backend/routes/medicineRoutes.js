const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');

// Route to add a new medicine
router.post('/add', medicineController.addMedicine);

// Route to get all medicines
router.get('/', medicineController.getAllMedicines);

module.exports = router; 