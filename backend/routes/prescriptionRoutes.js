import express from 'express';
import {
  createPrescription,
  getAllPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
  generatePDF
} from '../controllers/prescriptionController.js';

const router = express.Router();

router.post('/', createPrescription);
router.get('/', getAllPrescriptions);
router.get('/:id', getPrescriptionById);
router.put('/:id', updatePrescription);
router.delete('/:id', deletePrescription);
router.get('/:id/pdf', generatePDF);

export default router; 