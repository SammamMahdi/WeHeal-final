const express = require('express');
const router = express.Router();
const labTestController = require('../controllers/labTestController');

// Route to add a new lab test
router.post('/add', labTestController.addLabTest);

// Route to get all lab tests
router.get('/', labTestController.getAllLabTests);

module.exports = router; 