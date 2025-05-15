import React from 'react';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="patient-dashboard">
      {/* Other dashboard components */}
      <button onClick={() => navigate('/marketplace')}>Marketplace</button>
    </div>
  );
};

export default PatientDashboard; 