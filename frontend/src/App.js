// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import ForgotPassword from "./pages/ForgotPassword"; // Import ForgotPassword component
import VerifyEmail from "./pages/VerifyEmail"; // Import VerifyEmail component
import Login from "./pages/Login"; // Login page component
import Signup from "./pages/Signup"; // Example other page // Example dashboard after login
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import PatientDashboard from "./pages/dashboards/PatientDashboard";
import DoctorDashboard from "./pages/dashboards/DoctorDashboard";
import DriverDashboard from "./pages/dashboards/DriverDashboard";
import ClinicStaffDashboard from "./pages/dashboards/ClinicStaffDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import AdminUserDetails from "./pages/dashboards/AdminUserDetails";
import VideoCall from './components/VideoCall';
import Emergency from './pages/emergency/Emergency';
import EmergencyTrack from './pages/emergency/EmergencyTrack';
import EmergencyPatientDashboard from './pages/emergency/PatientDashboard';
import EmergencyDriverDashboard from './pages/emergency/DriverDashboard';
import PatientPrescriptionList from './pages/prescriptions/PatientPrescriptionList';
import PatientPrescriptionView from './pages/prescriptions/PatientPrescriptionView';
import DoctorPrescriptionList from './pages/prescriptions/DoctorPrescriptionList';
import DoctorPrescriptionView from './pages/prescriptions/DoctorPrescriptionView';
import PrescriptionForm from "./components/PrescriptionForm";
import Marketplace from "./pages/Marketplace";
import AdminProducts from "./pages/admin-view/products";
import AdminLabTests from "./pages/admin-view/lab-tests";
import AdminOrders from "./pages/admin-view/orders";
import AddMedicine from './pages/admin/AddMedicine';
import AddLabTest from './pages/admin/AddLabTest';


const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/" element={<Signup />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Navigate to="/dashboard/patient" />} />
          <Route path="/dashboard/patient" element={<PatientDashboard />} />
          <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
          <Route path="/dashboard/driver" element={<DriverDashboard />} />
          <Route path="/dashboard/clinic-staff" element={<ClinicStaffDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/user/:id" element={<AdminUserDetails />} />
          <Route path="/video-call/:appointmentId" element={<VideoCall />} />
          
          {/* Emergency Routes */}
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/emergency/track/:requestId" element={<EmergencyTrack />} />
          <Route path="/emergency/patient" element={<EmergencyPatientDashboard />} />
          <Route path="/emergency/driver" element={<EmergencyDriverDashboard />} />
          
          {/* Prescription Routes */}
          <Route path="/dashboard/patient/prescriptions" element={<PatientPrescriptionList />} />
          <Route path="/dashboard/patient/prescriptions/:id" element={<PatientPrescriptionView />} />
          <Route path="/dashboard/doctor/prescriptions" element={<DoctorPrescriptionList />} />
          <Route path="/dashboard/doctor/prescriptions/new" element={<PrescriptionForm />} />
          <Route path="/dashboard/doctor/prescriptions/:id" element={<DoctorPrescriptionView />} />
          <Route path="/dashboard/patient/marketplace" element={<Marketplace />} />
          <Route path="/dashboard/admin/products" element={<AdminProducts />} />
          <Route path="/dashboard/admin/lab-tests" element={<AdminLabTests />} />
          <Route path="/dashboard/admin/orders" element={<AdminOrders />} />
        </Route>

        {/* Additional Routes */}
        <Route path="/add-medicine" element={<AddMedicine />} />
        <Route path="/add-lab-test" element={<AddLabTest />} />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;