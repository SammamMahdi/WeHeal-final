import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

const EmergencyTrack = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [request, setRequest] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Fetch request details
  const fetchRequestDetails = async () => {
    try {
      const response = await api.get(`/emergency/details/${requestId}`);
      if (response.data.success) {
        setRequest(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch request details');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      console.error('Error fetching emergency request:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();

    // Auto refresh every 15 seconds if request is pending or in-progress
    const interval = setInterval(() => {
      if (request && (request.status === 'pending' || request.status === 'in-progress' || request.status === 'accepted')) {
        fetchRequestDetails();
      }
    }, 15000);

    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [requestId, request?.status]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p className="font-bold">Error</p>
        <p>{error}</p>
        <button 
          onClick={() => navigate('/emergency')} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
        <p>No request found with the provided ID.</p>
        <button 
          onClick={() => navigate('/emergency')} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Emergency Request Tracking</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold">{request.requestType} Request</h2>
            <p className="text-gray-500">ID: {request._id}</p>
            <p className="text-gray-500">Requested: {formatDate(request.createdAt)}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="font-semibold">Patient Information</h3>
            <p className="text-gray-700">Name: {request.patientName}</p>
            <p className="text-gray-700">Contact: {request.patientContact}</p>
          </div>
          <div>
            <h3 className="font-semibold">Locations</h3>
            <p className="text-gray-700">Pickup: {request.pickup.address}</p>
            <p className="text-gray-700">Destination: {request.destination.address}</p>
          </div>
        </div>

        {request.driverId && (
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Driver Information</h3>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 flex items-center justify-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">{request.driverId.name}</p>
                <p className="text-gray-600">Contact: {request.driverId.phone}</p>
                <p className="text-gray-600">Vehicle: {request.driverId.vehicle?.type || 'Standard Ambulance'}</p>
              </div>
            </div>
          </div>
        )}

        {request.status === 'completed' && (
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-2">Trip Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Started: {formatDate(request.acceptedAt)}</p>
                <p className="text-gray-600">Completed: {formatDate(request.completedAt)}</p>
              </div>
              <div>
                <p className="font-medium">Payment Status: {request.payment?.status || 'Pending'}</p>
                {request.payment?.amount && (
                  <p className="text-gray-600">Amount: ${request.payment.amount}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <button 
            onClick={() => navigate('/emergency')} 
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Back to Emergency Services
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyTrack;