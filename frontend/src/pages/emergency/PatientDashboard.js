import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPinIcon, PhoneIcon, TruckIcon, XMarkIcon, UserIcon, ExclamationTriangleIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { websocketService } from '../../services/websocket';
import { api } from '../../utils/api';
import '../../styles/EmergencyDashboard.css';

const REQUEST_STATUS = {
  pending: 'pending',
  accepted: 'accepted',
  started_journey: 'started_journey',
  on_the_way: 'on_the_way',
  almost_there: 'almost_there',
  looking_for_patient: 'looking_for_patient',
  received_patient: 'received_patient',
  dropping_off: 'dropping_off',
  completed: 'completed',
  cancelled: 'cancelled'
};

const STATUS_LABELS = {
  [REQUEST_STATUS.pending]: 'Searching for Driver',
  [REQUEST_STATUS.accepted]: 'Driver Found',
  [REQUEST_STATUS.started_journey]: 'Driver Started Journey',
  [REQUEST_STATUS.on_the_way]: 'Driver on the Way',
  [REQUEST_STATUS.almost_there]: 'Driver Almost There',
  [REQUEST_STATUS.looking_for_patient]: 'Driver Looking for You',
  [REQUEST_STATUS.received_patient]: 'Driver Received You',
  [REQUEST_STATUS.dropping_off]: 'Dropping Off',
  [REQUEST_STATUS.completed]: 'Journey Completed',
  [REQUEST_STATUS.cancelled]: 'Request Cancelled'
};

const STATUS_DESCRIPTIONS = {
  [REQUEST_STATUS.pending]: 'We are searching for a driver to assist you',
  [REQUEST_STATUS.accepted]: 'A driver has accepted your request and is on their way',
  [REQUEST_STATUS.started_journey]: 'Your driver has started their journey to your location',
  [REQUEST_STATUS.on_the_way]: 'Your driver is on their way to your location',
  [REQUEST_STATUS.almost_there]: 'Your driver is approaching your location',
  [REQUEST_STATUS.looking_for_patient]: 'Your driver has arrived and is looking for you',
  [REQUEST_STATUS.received_patient]: 'You have been picked up by the driver',
  [REQUEST_STATUS.dropping_off]: 'You are being taken to your destination',
  [REQUEST_STATUS.completed]: 'Your journey has been completed',
  [REQUEST_STATUS.cancelled]: 'Your request has been cancelled'
};

const STATUS_FLOW = [
  { status: REQUEST_STATUS.pending, label: 'Searching for Driver' },
  { status: REQUEST_STATUS.accepted, label: 'Driver Found' },
  { status: REQUEST_STATUS.started_journey, label: 'Driver Started Journey' },
  { status: REQUEST_STATUS.on_the_way, label: 'Driver on the Way' },
  { status: REQUEST_STATUS.almost_there, label: 'Driver Almost There' },
  { status: REQUEST_STATUS.looking_for_patient, label: 'Driver Looking for You' },
  { status: REQUEST_STATUS.received_patient, label: 'Driver Received You' },
  { status: REQUEST_STATUS.dropping_off, label: 'Dropping Off' },
  { status: REQUEST_STATUS.completed, label: 'Journey Completed' }
];

const EmergencyPatientDashboard = () => {
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState({
    location: '',
    description: '',
    emergencyType: 'cardiac',
    vehicleType: 'AC',
    phoneNumber: ''
  });
  const [activeRequest, setActiveRequest] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [user, setUser] = useState(null);
  const [showStatusGuide, setShowStatusGuide] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Restore persisted request on mount
  useEffect(() => {
    const stored = localStorage.getItem('activeRequest');
    if (stored) {
      const parsed = JSON.parse(stored);
      setActiveRequest(parsed);
      setRequestStatus(parsed.status);
      if (parsed.driver) {
        setDriverInfo(parsed.driver);
      }
      // Validate existence in backend; clear if not found
      api.get(`/emergency/details/${parsed.id}`)
        .then(response => {
          if (!response.data.success) {
            // Not found, clear state
            setActiveRequest(null);
            setRequestStatus(null);
            setDriverInfo(null);
            localStorage.removeItem('activeRequest');
          }
        })
        .catch(error => {
          if (error.response?.status === 404) {
            setActiveRequest(null);
            setRequestStatus(null);
            setDriverInfo(null);
            localStorage.removeItem('activeRequest');
          }
        });
    }
  }, []);

  useEffect(() => {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');

    // Connect to WebSocket
    console.log('Connecting to WebSocket from Patient Dashboard...');
    websocketService.connect();
    
    // Make sure we authenticate as a patient
    if (userData && userData._id) {
      setTimeout(() => {
        if (websocketService.socket?.connected) {
          console.log('Authenticating patient with Socket.IO');
          websocketService.socket.emit('authenticate', {
            userId: userData._id,
            userType: 'patient'
          });
        }
      }, 1000); // Give the socket a moment to connect
    }
    
    // Subscribe to request status updates
    const statusUpdateSubscription = websocketService.subscribe('request_status_update', (data) => {
      console.log('Received status update in patient dashboard:', data);
      // Use functional update to always get latest prev state
      setActiveRequest(prev => {
        if (!prev || prev.id !== data.requestId) return prev;
        // If completed or cancelled, clear the request
        if (data.status === REQUEST_STATUS.completed || data.status === REQUEST_STATUS.cancelled) {
          localStorage.removeItem('activeRequest');
          setRequestStatus(null);
          setDriverInfo(null);
          return null;
        }
        // Otherwise update and persist
        const updated = { ...prev, status: data.status, ...(data.driver && { driver: data.driver }) };
        localStorage.setItem('activeRequest', JSON.stringify(updated));
        setRequestStatus(data.status);
        if (data.driver) setDriverInfo(data.driver);
        return updated;
      });
    });
    
    // Cleanup function
    return () => {
      console.log('Cleaning up WebSocket subscriptions');
      websocketService.unsubscribe('request_status_update', statusUpdateSubscription);
    };
  }, [activeRequest]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceRequest = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Get user from context or localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      const newRequest = {
        id: `req_${Date.now()}`,
        patientInfo: {
          name: userData?.name || 'Anonymous',
          phone: requestData.phoneNumber || userData?.phone || 'N/A',
          email: userData?.email || 'N/A',
          patientId: userData?._id || 'anonymous'
        },
        location: requestData.location,
        emergencyType: requestData.emergencyType,
        vehicleType: requestData.vehicleType,
        description: requestData.description,
        status: 'pending',
        timestamp: new Date().toISOString()
      };

      console.log('Placing new emergency request:', newRequest);
      
      // Connect to WebSocket if not already connected
      websocketService.connect();
      
      // Send the request through WebSocket
      await websocketService.send('new_request', newRequest);
      
      // Update local state
      setActiveRequest(newRequest);
      setRequestStatus('pending');
      // Persist active request
      localStorage.setItem('activeRequest', JSON.stringify(newRequest));
      
      // Reset the form
      setRequestData({
        location: '',
        description: '',
        emergencyType: 'cardiac',
        vehicleType: 'AC',
        phoneNumber: ''
      });
    } catch (error) {
      console.error('Error placing emergency request:', error);
      alert('Failed to place emergency request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!activeRequest) return;
    
    setIsLoading(true);
    try {
      const cancelData = {
        requestId: activeRequest.id,
        status: 'cancelled',
        timestamp: new Date().toISOString()
      };
      
      console.log('Cancelling request:', cancelData);
      await websocketService.send('cancel_request', cancelData);
      
      setActiveRequest(null);
      setRequestStatus(null);
      setDriverInfo(null);
      // Remove persisted active request
      localStorage.removeItem('activeRequest');
    } catch (error) {
      console.error('Error cancelling request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToMainDashboard = () => {
    // Navigate back to patient dashboard
    navigate('/dashboard/patient');
  };

  const handleShowPayment = () => {
    setShowPaymentModal(true);
  };

  const handleCompletePayment = async () => {
    setIsLoading(true);
    try {
      // Here you would integrate with a payment gateway
      // For now, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Send payment completion to backend/websocket
      if (activeRequest) {
        await websocketService.send('payment_completed', {
          requestId: activeRequest.id,
          timestamp: new Date().toISOString()
        });
        
        // Update local state
        setActiveRequest(prev => ({
          ...prev,
          paymentStatus: 'completed'
        }));
      }
      
      setShowPaymentModal(false);
      alert('Payment completed successfully!');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusProgress = (status) => {
    const statusIndex = STATUS_FLOW.findIndex(step => step.status === status);
    if (statusIndex === -1) return 0;
    return ((statusIndex + 1) / STATUS_FLOW.length) * 100;
  };

  return (
    <div className="emergency-dashboard">
      <div className="dashboard-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-card"
        >
          <div className="dashboard-header">
            <motion.h1 
              className="dashboard-title"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Emergency Service
            </motion.h1>
          </div>

          <AnimatePresence>
            {activeRequest ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className={`request-card ${isLoading ? 'loading' : ''}`}>
                  <div className="request-header">
                    <h2 className="dashboard-title">Active Request</h2>
                    <div className="flex items-center space-x-2">
                      <motion.span
                        key={activeRequest.status}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`status-badge ${activeRequest.status}`}
                      >
                        {STATUS_LABELS[activeRequest.status] || activeRequest.status}
                      </motion.span>
                      <button
                        onClick={() => setShowStatusGuide(!showStatusGuide)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <ExclamationTriangleIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {showStatusGuide && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-blue-50 p-4 rounded-lg mb-4"
                      >
                        <p className="text-sm text-blue-800">
                          {STATUS_DESCRIPTIONS[activeRequest.status]}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar"
                      style={{ width: `${getStatusProgress(activeRequest.status)}%` }}
                    />
                    <div className="progress-steps">
                      {STATUS_FLOW.map((step, index) => (
                        <motion.div
                          key={step.status}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`progress-step ${
                            STATUS_FLOW.findIndex(s => s.status === activeRequest.status) >= index
                              ? 'completed'
                              : ''
                          }`}
                        >
                          <span className="step-dot" />
                          <span className="step-label">{step.label}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="request-info"
                    >
                      <MapPinIcon className="request-info-icon" />
                      <div className="request-info-content">
                        <p className="request-info-label">Location</p>
                        <p className="request-info-value">{activeRequest.location}</p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="request-info"
                    >
                      <TruckIcon className="request-info-icon" />
                      <div className="request-info-content">
                        <p className="request-info-label">Emergency Type</p>
                        <p className="request-info-value capitalize">{activeRequest.emergencyType}</p>
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className="request-info"
                    >
                      <TruckIcon className="request-info-icon" />
                      <div className="request-info-content">
                        <p className="request-info-label">Ambulance Type</p>
                        <p className="request-info-value">
                          {activeRequest.vehicleType === 'AC' && 'AC Ambulance - ৳1000 BDT'}
                          {activeRequest.vehicleType === 'ICU' && 'ICU Ambulance - ৳2000 BDT'}
                          {activeRequest.vehicleType === 'VIP' && 'VIP Ambulance - ৳3000 BDT'}
                        </p>
                      </div>
                    </motion.div>

                    {activeRequest.description && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="request-info"
                      >
                        <PhoneIcon className="request-info-icon" />
                        <div className="request-info-content">
                          <p className="request-info-label">Description</p>
                          <p className="request-info-value">{activeRequest.description}</p>
                        </div>
                      </motion.div>
                    )}

                    {driverInfo && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="request-info"
                      >
                        <UserIcon className="request-info-icon" />
                        <div className="request-info-content">
                          <p className="request-info-label">Driver Information</p>
                          <p className="request-info-value font-semibold">{driverInfo.name}</p>
                          <p className="request-info-value">
                            <span className="font-medium text-gray-700">Phone:</span> {driverInfo.phone}
                          </p>
                          <p className="request-info-value">
                            Vehicle: {driverInfo.vehicleType} - {driverInfo.vehicleNumber}
                          </p>
                          <div className="mt-2">
                            <a 
                              href={`tel:${driverInfo.phone}`}
                              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              <PhoneIcon className="h-4 w-4 mr-1" />
                              Call Driver
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="action-buttons">
                      {(activeRequest.status === REQUEST_STATUS.received_patient || 
                        activeRequest.status === REQUEST_STATUS.dropping_off) && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="btn btn-primary"
                          disabled={isLoading}
                          onClick={() => handleShowPayment()}
                        >
                          <CreditCardIcon className="h-5 w-5 mr-2" />
                          Make Payment
                        </motion.button>
                      )}
                      
                      {activeRequest.status === REQUEST_STATUS.completed && (
                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn btn-secondary"
                            onClick={handleBackToMainDashboard}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Back to Dashboard
                          </motion.button>
                        </div>
                      )}
                      
                      {activeRequest.status !== REQUEST_STATUS.completed && 
                       activeRequest.status !== REQUEST_STATUS.cancelled && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleCancelRequest}
                          className="btn btn-danger"
                          disabled={isLoading}
                        >
                          <XMarkIcon className="h-5 w-5 mr-2" />
                          Cancel Request
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handlePlaceRequest}
                className="form-container"
              >
                <div className="form-row">
                  <div className="form-col">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        value={requestData.location}
                        onChange={handleInputChange}
                        name="location"
                        className="form-input"
                        placeholder="Enter your location"
                        required
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label className="form-label">Emergency Type</label>
                      <select
                        value={requestData.emergencyType}
                        onChange={handleInputChange}
                        name="emergencyType"
                        className="form-select"
                        required
                      >
                        <option value="cardiac">Cardiac</option>
                        <option value="trauma">Trauma</option>
                        <option value="stroke">Stroke</option>
                        <option value="pregnancy">Pregnancy</option>
                        <option value="respiratory">Respiratory</option>
                        <option value="other">Other</option>
                      </select>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label className="form-label">Ambulance Type</label>
                      <select
                        value={requestData.vehicleType}
                        onChange={handleInputChange}
                        name="vehicleType"
                        className="form-select"
                        required
                      >
                        <option value="AC">AC Ambulance - ৳1000 BDT</option>
                        <option value="ICU">ICU Ambulance - ৳2000 BDT</option>
                        <option value="VIP">VIP Ambulance - ৳3000 BDT</option>
                      </select>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 }}
                    >
                      <label className="form-label">Contact Phone Number</label>
                      <input
                        type="tel"
                        value={requestData.phoneNumber}
                        onChange={handleInputChange}
                        name="phoneNumber"
                        className="form-input"
                        placeholder="Enter your contact number"
                        required
                      />
                    </motion.div>
                  </div>

                  <div className="form-col">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label className="form-label">Description</label>
                      <textarea
                        value={requestData.description}
                        onChange={handleInputChange}
                        name="description"
                        className="form-textarea"
                        placeholder="Describe your emergency"
                        required
                      />
                    </motion.div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <PhoneIcon className="h-5 w-5 mr-2" />
                      Request Emergency Service
                    </span>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Add payment modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Complete Payment</h3>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">Ambulance Service:</p>
              <p className="font-bold text-xl">
                {activeRequest.vehicleType === 'AC' && 'AC Ambulance - ৳1000 BDT'}
                {activeRequest.vehicleType === 'ICU' && 'ICU Ambulance - ৳2000 BDT'}
                {activeRequest.vehicleType === 'VIP' && 'VIP Ambulance - ৳3000 BDT'}
              </p>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleCompletePayment}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCardIcon className="h-5 w-5 mr-2" />
                    Pay Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyPatientDashboard; 