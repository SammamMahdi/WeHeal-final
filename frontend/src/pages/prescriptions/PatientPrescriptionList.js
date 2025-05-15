import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import PrescriptionList from '../../components/PrescriptionList';
import '../../components/PrescriptionList.css';

const PatientPrescriptionList = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  return (
    <div className="patient-prescriptions-page">
      <h1>My Prescriptions</h1>
      <PrescriptionList
        filterBy="patientName"
        filterValue={user.name}
        searchPlaceholder="Search by doctor name..."
      />
    </div>
  );
};

export default PatientPrescriptionList; 