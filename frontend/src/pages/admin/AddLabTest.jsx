import React, { useState } from 'react';
import axios from 'axios';

const AddLabTest = () => {
  const [labTest, setLabTest] = useState({ name: '', price: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLabTest((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/lab-tests/add', labTest);
      if (response.data.success) {
        setMessage('Lab test added successfully');
        setLabTest({ name: '', price: '' });
      } else {
        setMessage('Failed to add lab test');
      }
    } catch (error) {
      setMessage('Error adding lab test');
    }
  };

  return (
    <div className="add-lab-test">
      <h2>Add Lab Test</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={labTest.name}
          onChange={handleChange}
          placeholder="Lab Test Name"
          required
        />
        <input
          type="number"
          name="price"
          value={labTest.price}
          onChange={handleChange}
          placeholder="Price"
          required
        />
        <button type="submit">Add Lab Test</button>
      </form>
    </div>
  );
};

export default AddLabTest; 