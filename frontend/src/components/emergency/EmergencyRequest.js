import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

const EmergencyRequest = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    pickup: '',
    destination: '',
    patientName: '',
    patientContact: '',
    requestType: 'emergency'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/emergency/request', formData);
      
      if (response.data.success) {
        // Navigate to tracking page with request ID
        navigate(`/emergency/track/${response.data.data._id}`);
      } else {
        setError(response.data.message || 'Failed to create emergency request');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      console.error('Error creating emergency request:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Request Emergency Service</h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="pickup" className="block mb-1 font-medium">Pickup Location</label>
          <input 
            type="text" 
            id="pickup" 
            name="pickup"
            value={formData.pickup}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded" 
            placeholder="Enter pickup address"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="destination" className="block mb-1 font-medium">Destination</label>
          <input 
            type="text" 
            id="destination" 
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded" 
            placeholder="Enter hospital or destination address"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="patientName" className="block mb-1 font-medium">Patient Name</label>
          <input 
            type="text" 
            id="patientName" 
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded" 
            placeholder="Enter patient name"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="patientContact" className="block mb-1 font-medium">Patient Contact</label>
          <input 
            type="text" 
            id="patientContact" 
            name="patientContact"
            value={formData.patientContact}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded" 
            placeholder="Enter contact number"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="requestType" className="block mb-1 font-medium">Request Type</label>
          <select 
            id="requestType" 
            name="requestType"
            value={formData.requestType}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded" 
            required
          >
            <option value="emergency">Emergency</option>
            <option value="non-emergency">Non-Emergency</option>
            <option value="patient-transfer">Patient Transfer</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="w-full p-2 bg-red-600 text-white font-medium rounded hover:bg-red-700"
          disabled={isLoading}
        >
          {isLoading ? 'Requesting...' : 'Request Ambulance'}
        </button>
      </form>
    </div>
  );
};

export default EmergencyRequest;