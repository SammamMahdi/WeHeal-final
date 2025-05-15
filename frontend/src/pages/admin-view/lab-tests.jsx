import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminLabTests = () => {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await axios.get('/api/lab-tests', { withCredentials: true });
      if (res.data && res.data.tests) setTests(res.data.tests);
    } catch (err) {
      console.error('Error fetching lab tests:', err);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Lab Tests Management</h1>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Test Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Home Collection</th>
          </tr>
        </thead>
        <tbody>
          {tests.map(t => (
            <tr key={t._id}>
              <td>{t.testName}</td>
              <td>{t.category}</td>
              <td>{t.discountPrice || t.price}</td>
              <td>{t.isHomeCollection ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminLabTests; 