import React from 'react';
import { useOutletContext } from 'react-router-dom';
import PrescriptionList from '../../components/PrescriptionList';
import '../../components/PrescriptionList.css';

const DoctorPrescriptionList = () => {
  const { user } = useOutletContext();

  return (
    <div className="doctor-prescriptions-page">
      <h1>Prescriptions I've Issued</h1>
      <PrescriptionList
        filterBy="doctorName"
        filterValue={user.name}
        searchPlaceholder="Search by patient name..."
      />
    </div>
  );
};

export default DoctorPrescriptionList; 