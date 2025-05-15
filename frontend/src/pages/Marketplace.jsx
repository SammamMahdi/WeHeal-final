import React from 'react';
import { useNavigate } from 'react-router-dom';

const Marketplace = () => {
  const navigate = useNavigate();

  return (
    <div className="marketplace">
      <h1>Marketplace</h1>
      <button onClick={() => navigate('/order-medicine')}>Order Medicine</button>
      <button onClick={() => navigate('/order-lab-test')}>Order Lab Test</button>
      <button onClick={() => navigate('/upload-prescription')}>Upload Prescription to Order</button>
      <button onClick={() => navigate('/monthly-medicine-order')}>Monthly Medicine Order</button>
      <button onClick={() => navigate('/order-history')}>Order History</button>
    </div>
  );
};

export default Marketplace; 