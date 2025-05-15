import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  instructions: { type: String, required: true }
});

const prescriptionSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  doctorName: { type: String, required: true },
  date: { type: Date, default: Date.now },
  medications: [medicationSchema],
  symptoms: { type: String },
  recommendedTests: { type: String },
  nextAppointment: { type: Date },
  notes: { type: String }
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription; 