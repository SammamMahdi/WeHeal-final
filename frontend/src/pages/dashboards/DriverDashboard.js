import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { logoutUser } from '../../utils/api';
import { initFeatherIcons } from '../../utils/api';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // If user is loaded, navigate to emergency driver dashboard
    if (user) {
      // Redirect to emergency driver dashboard
      navigate('/emergency/driver');
    }
    
    initFeatherIcons();
  }, [user, navigate]);
  
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (!user) {
    return <div>Please log in to view your dashboard.</div>;
  }
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="patient-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Welcome back, {user.name}</h1>
          <p>Loading Driver Dashboard...</p>
        </div>
        <div className="header-right">
          <div className="profile-section">
            <img src="https://i.pravatar.cc/40" alt="Profile" />
            <div className="profile-info">
              <span>{user.name}</span>
              <small>Driver</small>
            </div>
            <button className="btn btn-secondary" onClick={handleLogout}>
              <i data-feather="log-out"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
      <div className="text-center py-8">
        <p>Redirecting to emergency dashboard...</p>
        <div className="loading-spinner mt-4"></div>
      </div>
    </div>
  );
};

export default DriverDashboard; 