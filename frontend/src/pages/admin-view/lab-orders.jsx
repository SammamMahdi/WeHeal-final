import React from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent } from "@/components/ui/card";

const AdminLabOrders = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Lab Test Orders Management</h1>
      
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-lg">Lab test order management functionality will be implemented here.</p>
          <p>This page will allow viewing and managing lab test orders, updating order statuses, uploading reports, etc.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLabOrders; 