import React, { useState } from 'react';
import axios from 'axios';

const AddMedicine = () => {
  const [medicine, setMedicine] = useState({ name: '', price: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMedicine((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/medicines/add', medicine);
      if (response.data.success) {
        setMessage('Medicine added successfully');
        setMedicine({ name: '', price: '' });
      } else {
        setMessage('Failed to add medicine');
      }
    } catch (error) {
      setMessage('Error adding medicine');
    }
  };

  return (
    <div className="add-medicine">
      <h2>Add Medicine</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={medicine.name}
          onChange={handleChange}
          placeholder="Medicine Name"
          required
        />
        <input
          type="number"
          name="price"
          value={medicine.price}
          onChange={handleChange}
          placeholder="Price"
          required
        />
        <button type="submit">Add Medicine</button>
      </form>
    </div>
  );
};

export default AddMedicine; 