import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';
import './PrescriptionForm.css';

const initialMedicine = { name: '', dosage: '', instructions: '' };

const PrescriptionForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialPatientName = location.state?.patientName || '';
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initialDoctorName = user.name || '';

  const [form, setForm] = useState({
    patientName: initialPatientName,
    doctorName: initialDoctorName,
    date: new Date().toISOString().split('T')[0],
    symptoms: '',
    medications: [initialMedicine],
    recommendedTests: '',
    nextAppointment: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMedicineChange = (idx, field, value) => {
    setForm(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => i === idx ? { ...med, [field]: value } : med)
    }));
  };

  const addMedicine = () => {
    setForm(prev => ({ ...prev, medications: [...prev.medications, initialMedicine] }));
  };

  const removeMedicine = (idx) => {
    setForm(prev => ({ ...prev, medications: prev.medications.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/prescriptions', form);
      if (res.data.success) {
        navigate('/dashboard/doctor/prescriptions');
      } else {
        setError('Failed to create prescription');
      }
    } catch {
      setError('Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prescription-form-container">
      <h2 className="prescription-form-title">Create Prescription</h2>
      {error && <div className="prescription-form-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="prescription-form-section">
          <div className="prescription-form-section-title">Patient & Doctor Info</div>
          <label className="prescription-form-label">Patient Name *</label>
          <input
            className="prescription-form-input"
            name="patientName"
            value={form.patientName}
            disabled
          />
          <label className="prescription-form-label">Doctor Name *</label>
          <input
            className="prescription-form-input"
            name="doctorName"
            value={form.doctorName}
            disabled
          />
          <label className="prescription-form-label">Date *</label>
          <input
            className="prescription-form-input"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="prescription-form-section">
          <div className="prescription-form-section-title">Symptoms</div>
          <textarea
            className="prescription-form-tests-list"
            name="symptoms"
            placeholder="Enter each symptom on a new line"
            value={form.symptoms}
            onChange={handleChange}
          />
        </div>

        <div className="prescription-form-section">
          <div className="prescription-form-section-title">Medicines</div>
          {form.medications.map((med, idx) => (
            <div key={idx} className="prescription-form-meds-row">
              <input
                className="prescription-form-input"
                placeholder="Name"
                value={med.name}
                required
                onChange={e => handleMedicineChange(idx, 'name', e.target.value)}
              />
              <input
                className="prescription-form-input"
                placeholder="Dosage"
                value={med.dosage}
                required
                onChange={e => handleMedicineChange(idx, 'dosage', e.target.value)}
              />
              <input
                className="prescription-form-input"
                placeholder="Instructions"
                value={med.instructions}
                required
                onChange={e => handleMedicineChange(idx, 'instructions', e.target.value)}
              />
              {form.medications.length > 1 && (
                <button
                  type="button"
                  className="prescription-form-remove-btn"
                  onClick={() => removeMedicine(idx)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="prescription-form-add-btn"
            onClick={addMedicine}
          >
            + Add Another Medicine
          </button>
        </div>

        <div className="prescription-form-section">
          <div className="prescription-form-section-title">Recommended Tests</div>
          <textarea
            className="prescription-form-tests-list"
            name="recommendedTests"
            placeholder="Enter each test on a new line"
            value={form.recommendedTests}
            onChange={handleChange}
          />
        </div>

        <div className="prescription-form-section">
          <div className="prescription-form-section-title">Next Appointment</div>
          <input
            className="prescription-form-input"
            type="date"
            name="nextAppointment"
            value={form.nextAppointment}
            onChange={handleChange}
          />
        </div>

        <div className="prescription-form-section">
          <div className="prescription-form-section-title">Extra Instructions</div>
          <textarea
            className="prescription-form-textarea"
            name="notes"
            placeholder="e.g. Drink plenty of water, rest, etc."
            value={form.notes}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className="prescription-form-submit-btn"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Create Prescription'}
        </button>
      </form>
    </div>
  );
};

export default PrescriptionForm; 