import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, FileText, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const statusColors = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Approved': 'bg-blue-100 text-blue-800',
  'Sample Collected': 'bg-purple-100 text-purple-800',
  'Processing': 'bg-indigo-100 text-indigo-800',
  'Completed': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800'
};

const LabTestOrders = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeOrderTab, setActiveOrderTab] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    
    fetchOrders();
  }, [isAuthenticated, currentPage, activeOrderTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', 10);
      
      if (activeOrderTab !== 'all') {
        params.append('status', activeOrderTab);
      }
      
      const response = await axios.get(
        `http://localhost:5000/api/lab-orders?${params.toString()}`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setOrders(response.data.orders);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/lab-orders/${orderId}/cancel`,
        {},
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast.success('Order cancelled successfully');
        fetchOrders();
        setModalOpen(false);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleDownloadReport = async (orderId, reportId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/lab-orders/${orderId}/reports/${reportId}`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        // In a real app, this would download the file
        // For this example, we'll just open the URL in a new tab
        window.open(response.data.report.fileUrl, '_blank');
        toast.success('Downloading report');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">My Lab Test Orders</h1>
      
      <Tabs 
        value={activeOrderTab} 
        onValueChange={setActiveOrderTab}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="Pending">Pending</TabsTrigger>
          <TabsTrigger value="Approved">Approved</TabsTrigger>
          <TabsTrigger value="Sample Collected">Sample Collected</TabsTrigger>
          <TabsTrigger value="Processing">Processing</TabsTrigger>
          <TabsTrigger value="Completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="w-full animate-pulse">
              <CardContent className="p-4">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Tests</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{format(new Date(order.createdAt), 'dd MMM yyyy')}</TableCell>
                    <TableCell>
                      {order.selectedTests.map((test, index) => (
                        <div key={index}>
                          {test.test.testName}
                          {index < order.selectedTests.length - 1 && ', '}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status] || ''}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{order.totalAmount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDetails(order)}
                        >
                          Details
                        </Button>
                        
                        {order.status === 'Pending' && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleCancelOrder(order._id)}
                          >
                            Cancel
                          </Button>
                        )}
                        
                        {order.status === 'Completed' && order.reports && order.reports.length > 0 && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex items-center gap-1"
                            onClick={() => handleDownloadReport(order._id, order.reports[0]._id)}
                          >
                            <Download className="h-4 w-4" /> Report
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  if (
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)} 
                          isActive={page === currentPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return <PaginationItem key={page}>...</PaginationItem>;
                  }
                  return null;
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center justify-center">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">No Orders Found</h3>
              <p className="text-gray-500 mb-6">You haven't placed any lab test orders yet.</p>
              <Button onClick={() => navigate('/shop/lab-tests')}>Browse Lab Tests</Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder.orderNumber}</DialogTitle>
              <DialogDescription>
                Placed on {format(new Date(selectedOrder.createdAt), 'dd MMMM yyyy')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Patient Information</h3>
                <div className="space-y-1">
                  <p><span className="font-medium">Name:</span> {selectedOrder.patientInfo.name}</p>
                  <p><span className="font-medium">Age:</span> {selectedOrder.patientInfo.age}</p>
                  <p><span className="font-medium">Gender:</span> {selectedOrder.patientInfo.gender}</p>
                  <p><span className="font-medium">Phone:</span> {selectedOrder.patientInfo.phone}</p>
                  {selectedOrder.patientInfo.email && (
                    <p><span className="font-medium">Email:</span> {selectedOrder.patientInfo.email}</p>
                  )}
                  {selectedOrder.patientInfo.address && (
                    <p><span className="font-medium">Address:</span> {selectedOrder.patientInfo.address}</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Appointment Details</h3>
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">Date:</span> {' '}
                    {format(new Date(selectedOrder.appointmentDetails.date), 'dd MMMM yyyy')}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span> {' '}
                    {selectedOrder.appointmentDetails.slot.startTime} - {selectedOrder.appointmentDetails.slot.endTime}
                  </p>
                  <p>
                    <span className="font-medium">Lab:</span> {' '}
                    {selectedOrder.selectedLab.labName}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span> {' '}
                    {selectedOrder.selectedLab.location}
                  </p>
                  <p>
                    <span className="font-medium">Collection Type:</span> {' '}
                    {selectedOrder.appointmentDetails.isHomeCollection ? 'Home Collection' : 'Lab Visit'}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Tests Ordered</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedOrder.selectedTests.map((test, index) => (
                    <TableRow key={index}>
                      <TableCell>{test.test.testName}</TableCell>
                      <TableCell>{test.test.category}</TableCell>
                      <TableCell className="text-right">₹{test.price}</TableCell>
                    </TableRow>
                  ))}
                  {selectedOrder.appointmentDetails.isHomeCollection && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-right font-medium">Home Collection Fee</TableCell>
                      <TableCell className="text-right">₹{selectedOrder.totalAmount - selectedOrder.selectedTests.reduce((sum, test) => sum + test.price, 0)}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell colSpan={2} className="text-right font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">₹{selectedOrder.totalAmount}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Order Status</h3>
              <div className="relative mb-8">
                <div className="flex items-center justify-between mb-2">
                  {['Pending', 'Approved', 'Sample Collected', 'Processing', 'Completed'].map((status, index) => {
                    const isActive = ['Pending', 'Approved', 'Sample Collected', 'Processing', 'Completed'].indexOf(selectedOrder.status) >= index;
                    const isCurrent = selectedOrder.status === status;
                    
                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div className={`rounded-full h-8 w-8 flex items-center justify-center mb-1 ${isActive ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                          {index + 1}
                        </div>
                        <span className={`text-xs text-center ${isCurrent ? 'font-bold' : ''}`}>{status}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 -z-10">
                  <div 
                    className="h-full bg-primary" 
                    style={{ 
                      width: `${selectedOrder.status === 'Cancelled' ? 0 : Math.min(100, ['Pending', 'Approved', 'Sample Collected', 'Processing', 'Completed'].indexOf(selectedOrder.status) * 25)}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              {selectedOrder.status === 'Cancelled' && (
                <div className="flex items-center gap-2 text-red-600 mb-4">
                  <AlertCircle className="h-5 w-5" />
                  <span>This order was cancelled</span>
                </div>
              )}
              
              {selectedOrder.status === 'Completed' && selectedOrder.reports && selectedOrder.reports.length > 0 ? (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Test Reports</h3>
                  <div className="space-y-3">
                    {selectedOrder.reports.map((report) => (
                      <Card key={report._id}>
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium">{report.reportName}</p>
                              <p className="text-sm text-gray-500">
                                Uploaded on {format(new Date(report.uploadDate), 'dd MMM yyyy')}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => handleDownloadReport(selectedOrder._id, report._id)}
                          >
                            <Download className="h-4 w-4" /> Download
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : selectedOrder.status === 'Completed' ? (
                <div className="flex items-center gap-2 text-amber-600">
                  <Clock className="h-5 w-5" />
                  <span>Reports will be available soon</span>
                </div>
              ) : null}
            </div>
            
            <DialogFooter>
              {selectedOrder.status === 'Pending' && (
                <Button 
                  variant="destructive"
                  onClick={() => handleCancelOrder(selectedOrder._id)}
                >
                  Cancel Order
                </Button>
              )}
              <Button variant="outline" onClick={() => setModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default LabTestOrders;