import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import './PrescriptionView.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PrescriptionView = () => {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfError, setPdfError] = useState('');

  useEffect(() => {
    api.get(`/prescriptions/${id}`)
      .then(res => {
        if (res.data.success) setPrescription(res.data.data);
        else setError('Failed to load prescription');
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load prescription');
        setLoading(false);
      });
  }, [id]);

  const handleDownloadPDF = async () => {
    const input = document.querySelector('.prescription-view-container');
    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      pdf.save(`prescription-${id}.pdf`);
    } catch (e) {
      console.error('PDF generation error:', e);
      setPdfError('Failed to generate PDF.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!prescription) return <div>Not found</div>;

  return (
    <div className="prescription-view-container">
      {/* Header */}
      <div className="prescription-view-header">
        <div>
          <div className="prescription-view-header-logo">WeHeal</div>
          <div>Dr. {prescription.doctorName}</div>
          <div>{user.doctorDetails?.location || ''}</div>
          <div>{user.email}</div>
        </div>
        <div className="prescription-view-header-info">
          <div className="prescription-no">Prescription no.: [{prescription._id}]</div>
          <div className="prescription-date">Date: {new Date(prescription.date).toLocaleDateString()}</div>
        </div>
      </div>
      {/* Patient Info */}
      <div className="prescription-view-patient-row">
        <span>Mr./Ms./Mrs. {prescription.patientName}</span>
        <span>Age: --</span>
      </div>
      {/* Main Content */}
      <div className="prescription-view-main">
        <div className="prescription-view-col">
          {prescription.symptoms && (
            <>
              <div className="prescription-view-section-title">Symptoms:</div>
              <ul className="prescription-view-list">
                {prescription.symptoms.split('\n').map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </>
          )}
          {prescription.recommendedTests && (
            <>
              <div className="prescription-view-section-title">Recommended Tests:</div>
              <ol className="prescription-view-list">
                {prescription.recommendedTests.split('\n').map((t, i) => <li key={i}>{t}</li>)}
              </ol>
            </>
          )}
        </div>
        <div className="prescription-view-col">
          <div className="prescription-view-section-title">Medicines:</div>
          <ul className="prescription-view-meds-list">
            {prescription.medications.map((m, i) => (
              <li key={i}><strong>{m.name}</strong>, {m.dosage}; {m.instructions}</li>
            ))}
          </ul>
          {prescription.notes && (
            <p className="prescription-view-instructions"><strong>Instruction:</strong> {prescription.notes}</p>
          )}
          {prescription.nextAppointment && (
            <p className="prescription-view-next-appointment"><strong>Next Appointment:</strong> {new Date(prescription.nextAppointment).toLocaleDateString()}</p>
          )}
        </div>
      </div>
      {/* Footer */}
      <div className="prescription-view-footer">
        <span>📞 {user.phone || '[+1-392-747-4830]'}</span>
        <span>✉️ {user.email || '[youremail@companyname.com]'}</span>
      </div>
      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
        <button onClick={handleDownloadPDF} className="btn btn-primary">Download PDF</button>
        <Link to="/dashboard/doctor/prescriptions" className="btn">Back to List</Link>
      </div>
      {pdfError && <div style={{ color: 'red', textAlign: 'center' }}>{pdfError}</div>}
    </div>
  );
};

export default PrescriptionView; 