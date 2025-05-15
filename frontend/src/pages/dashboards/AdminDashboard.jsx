import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <button onClick={() => navigate('/add-medicine')}>Add Medicine</button>
      <button onClick={() => navigate('/add-lab-test')}>Add Lab Tests</button>
      <button onClick={() => navigate('/view-all-products')}>View All Products</button>
      <button onClick={() => navigate('/order-history')}>Order History</button>
      <button onClick={() => navigate('/view-new-orders')}>View New Orders</button>
    </div>
  );
};

export default AdminDashboard; 