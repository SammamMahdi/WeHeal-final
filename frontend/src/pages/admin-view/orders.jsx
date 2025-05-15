import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/shop/order/my-orders', { withCredentials: true });
      if (res.data && res.data.orders) setOrders(res.data.orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Order History</h1>
      <table border="1" cellPadding="8">
        <thead>
          <tr><th>Order ID</th><th>Date</th><th>Items</th><th>Total</th></tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o._id}>
              <td>{o._id}</td>
              <td>{new Date(o.createdAt).toLocaleString()}</td>
              <td>{o.orderItems?.length || 0}</td>
              <td>{o.totalPrice || o.totalAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrders; 