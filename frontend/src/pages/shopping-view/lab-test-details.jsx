import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Clock, MapPin, Home, Microscope, FileText, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

const LabTestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLab, setSelectedLab] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isHomeCollection, setIsHomeCollection] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    address: ''
  });

  // Fetch test details
  useEffect(() => {
    const fetchTestDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/lab-tests/${id}`);
        if (response.data.success) {
          setTest(response.data.test);
          
          // Initialize with first lab if available
          if (response.data.test.availableLabs && response.data.test.availableLabs.length > 0) {
            setSelectedLab(response.data.test.availableLabs[0].labName);
          }
          
          // Pre-fill patient info if user is logged in
          if (user) {
            setPatientInfo(prev => ({
              ...prev,
              name: user.name || '',
              email: user.email || '',
              phone: user.phone || ''
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching test details:', error);
        toast.error('Failed to load test details');
      } finally {
        setLoading(false);
      }
    };

    fetchTestDetails();
  }, [id, user]);

  // Fetch available slots when lab or date changes
  useEffect(() => {
    if (!selectedLab || !selectedDate) return;
    
    const fetchSlots = async () => {
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const response = await axios.get(
          `http://localhost:5000/api/lab-tests/${id}/labs/${selectedLab}/slots?date=${formattedDate}`
        );
        
        if (response.data.success) {
          // Format slots data
          let slots = [];
          if (response.data.availableSlots && response.data.availableSlots.length > 0) {
            response.data.availableSlots.forEach(slotDay => {
              slotDay.slots.forEach(slot => {
                if (!slot.isBooked) {
                  slots.push(slot);
                }
              });
            });
          }
          setAvailableSlots(slots);
          setSelectedSlot(null); // Reset selected slot
        }
      } catch (error) {
        console.error('Error fetching slots:', error);
        toast.error('Failed to load available slots');
      }
    };

    fetchSlots();
  }, [id, selectedLab, selectedDate]);

  const handlePatientInfoChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLabChange = (labName) => {
    setSelectedLab(labName);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleHomeCollectionToggle = () => {
    if (!test.isHomeCollection) {
      toast.error('Home collection is not available for this test');
      return;
    }
    setIsHomeCollection(!isHomeCollection);
  };

  const handleBookTest = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to book a test');
      navigate('/auth/login');
      return;
    }
    
    // Validate form
    if (!patientInfo.name || !patientInfo.age || !patientInfo.gender || !patientInfo.phone) {
      toast.error('Please fill all required patient information');
      return;
    }
    
    if (!selectedLab) {
      toast.error('Please select a lab');
      return;
    }
    
    if (!selectedSlot) {
      toast.error('Please select an appointment slot');
      return;
    }
    
    if (isHomeCollection && !patientInfo.address) {
      toast.error('Address is required for home collection');
      return;
    }
    
    try {
      // Find selected lab details
      const lab = test.availableLabs.find(lab => lab.labName === selectedLab);
      
      // Prepare order data
      const orderData = {
        patientInfo: {
          name: patientInfo.name,
          age: parseInt(patientInfo.age),
          gender: patientInfo.gender,
          phone: patientInfo.phone,
          email: patientInfo.email,
          address: patientInfo.address
        },
        selectedTests: [
          { testId: test._id }
        ],
        selectedLab: {
          labName: selectedLab,
          location: lab.location
        },
        appointmentDetails: {
          date: selectedDate.toISOString(),
          slot: selectedSlot,
          isHomeCollection
        }
      };
      
      // Submit order
      const response = await axios.post(
        'http://localhost:5000/api/lab-orders',
        orderData,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast.success('Test booked successfully!');
        // Navigate to checkout with order ID
        navigate(`/shop/checkout?orderId=${response.data.order._id}`);
      }
    } catch (error) {
      console.error('Error booking test:', error);
      toast.error(error.response?.data?.message || 'Failed to book test');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded w-full mb-6"></div>
            </div>
            <div className="md:col-span-1">
              <div className="h-64 bg-gray-200 rounded w-full mb-6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Test Not Found</h2>
        <p className="mb-6">The requested lab test could not be found.</p>
        <Button onClick={() => navigate('/shop/lab-tests')}>Back to Lab Tests</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        variant="outline" 
        onClick={() => navigate('/shop/lab-tests')}
        className="mb-6"
      >
        Back to Lab Tests
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Test Details */}
        <div className="md:col-span-2">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{test.testName}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline">{test.category}</Badge>
              <Badge variant="outline">Code: {test.testCode}</Badge>
              {test.isHomeCollection && (
                <Badge variant="success">Home Collection Available</Badge>
              )}
            </div>
            <p className="text-lg mb-4">{test.description}</p>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-xl font-bold">
                ₹{test.discountPrice || test.price}
              </div>
              {test.discountPrice && (
                <div className="text-gray-500 line-through">₹{test.price}</div>
              )}
            </div>
            {test.isHomeCollection && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Home collection fee: ₹{test.homeCollectionFee}
                </p>
              </div>
            )}
          </div>

          <Tabs defaultValue="instructions">
            <TabsList className="mb-4">
              <TabsTrigger value="instructions">Preparation Instructions</TabsTrigger>
              <TabsTrigger value="sampleInfo">Sample Information</TabsTrigger>
              <TabsTrigger value="labs">Available Labs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="instructions">
              <Card>
                <CardHeader>
                  <CardTitle>Preparation Instructions</CardTitle>
                  <CardDescription>Follow these instructions before your test</CardDescription>
                </CardHeader>
                <CardContent>
                  {test.preparationInstructions ? (
                    <div className="prose max-w-none">
                      <p>{test.preparationInstructions}</p>
                    </div>
                  ) : (
                    <p>No special preparation required for this test.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sampleInfo">
              <Card>
                <CardHeader>
                  <CardTitle>Sample Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <Microscope className="h-5 w-5 mt-0.5 text-gray-500" />
                      <div>
                        <h4 className="font-medium">Sample Type</h4>
                        <p>{test.sampleType || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-5 w-5 mt-0.5 text-gray-500" />
                      <div>
                        <h4 className="font-medium">Turn Around Time</h4>
                        <p>{test.turnAroundTime || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="labs">
              <Card>
                <CardHeader>
                  <CardTitle>Available Labs</CardTitle>
                  <CardDescription>These labs can process your test</CardDescription>
                </CardHeader>
                <CardContent>
                  {test.availableLabs && test.availableLabs.length > 0 ? (
                    <div className="space-y-4">
                      {test.availableLabs.map((lab, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <MapPin className="h-5 w-5 mt-0.5 text-gray-500" />
                          <div>
                            <h4 className="font-medium">{lab.labName}</h4>
                            <p className="text-sm text-gray-600">{lab.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No labs available for this test.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Booking Card */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Book This Test</CardTitle>
              <CardDescription>Fill in the details to book your appointment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Patient Information */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Patient Information</h3>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input 
                        id="name" 
                        name="name"
                        value={patientInfo.name}
                        onChange={handlePatientInfoChange}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="age">Age *</Label>
                        <Input 
                          id="age" 
                          name="age"
                          type="number" 
                          value={patientInfo.age}
                          onChange={handlePatientInfoChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender">Gender *</Label>
                        <Select 
                          value={patientInfo.gender} 
                          onValueChange={(value) => setPatientInfo(prev => ({ ...prev, gender: value }))}
                        >
                          <SelectTrigger id="gender">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input 
                        id="phone" 
                        name="phone"
                        value={patientInfo.phone}
                        onChange={handlePatientInfoChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email"
                        value={patientInfo.email}
                        onChange={handlePatientInfoChange}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Collection Type */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Collection Type</h3>
                  <RadioGroup 
                    defaultValue="lab"
                    value={isHomeCollection ? "home" : "lab"}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="lab" 
                        id="collection-lab"
                        onClick={() => setIsHomeCollection(false)}
                      />
                      <Label htmlFor="collection-lab" className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> Visit Lab
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="home" 
                        id="collection-home"
                        disabled={!test.isHomeCollection}
                        onClick={handleHomeCollectionToggle}
                      />
                      <Label htmlFor="collection-home" className="flex items-center gap-1">
                        <Home className="h-4 w-4" /> Home Collection 
                        {test.isHomeCollection && (
                          <span className="text-sm text-gray-500">+₹{test.homeCollectionFee}</span>
                        )}
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  {isHomeCollection && (
                    <div className="mt-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input 
                        id="address" 
                        name="address"
                        value={patientInfo.address}
                        onChange={handlePatientInfoChange}
                        required
                      />
                    </div>
                  )}
                </div>
                
                <Separator />
                
                {/* Lab Selection */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Select Lab</h3>
                  {test.availableLabs && test.availableLabs.length > 0 ? (
                    <div className="grid gap-2">
                      {test.availableLabs.map((lab, index) => (
                        <Card 
                          key={index} 
                          className={`cursor-pointer transition-all ${selectedLab === lab.labName ? 'border-primary' : ''}`}
                          onClick={() => handleLabChange(lab.labName)}
                        >
                          <CardContent className="p-3">
                            <div className="font-medium">{lab.labName}</div>
                            <div className="text-sm text-gray-600">{lab.location}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> No labs available
                    </p>
                  )}
                </div>
                
                {/* Date Selection */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Select Date</h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    className="rounded-md border"
                    disabled={(date) => date < new Date()}
                  />
                </div>
                
                {/* Time Slot Selection */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Select Time Slot</h3>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {availableSlots.map((slot, index) => (
                        <Button 
                          key={index}
                          variant={selectedSlot === slot ? "default" : "outline"}
                          className="justify-start"
                          onClick={() => handleSlotSelect(slot)}
                        >
                          {slot.startTime} - {slot.endTime}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-amber-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> No slots available for this date
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleBookTest}
                disabled={!selectedLab || !selectedSlot}
              >
                Book Now
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LabTestDetails; 