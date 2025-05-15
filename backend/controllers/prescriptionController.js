import Prescription from '../models/prescription.model.js';
import PDFDocument from 'pdfkit';

// Create a new prescription
export const createPrescription = async (req, res) => {
  try {
    const prescription = new Prescription(req.body);
    await prescription.save();
    res.status(201).json({ success: true, data: prescription });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all prescriptions
export const getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find();
    res.json({ success: true, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single prescription by custom ID field
export const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    res.json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a prescription
export const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Prescription.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a prescription
export const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Prescription.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    res.json({ success: true, message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate PDF for a prescription
export const generatePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription-${id}.pdf`);
    doc.pipe(res);

    doc.fontSize(25).text('Medical Prescription', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Patient Name: ${prescription.patientName}`);
    doc.text(`Doctor Name: ${prescription.doctorName}`);
    doc.text(`Date: ${prescription.date.toISOString()}`);
    doc.moveDown();
    doc.text('Medications:');
    prescription.medications.forEach(med => {
      doc.text(`- ${med.name}: ${med.dosage} - ${med.instructions}`);
    });
    doc.moveDown();
    doc.text(`Additional Notes: ${prescription.notes || ''}`);

    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 