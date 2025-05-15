import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAdminOrders } from "../../store/admin/order-slice";
import { fetchAdminProducts } from "../../store/admin/products-slice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.adminOrder);
  const { products } = useSelector((state) => state.adminProducts);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [productStats, setProductStats] = useState([]);

  useEffect(() => {
    dispatch(fetchAdminOrders());
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  useEffect(() => {
    if (orders && orders.length > 0) {
      // Calculate order statistics
      const stats = {
        total: orders.length,
        pending: orders.filter((order) => order.status === "pending").length,
        processing: orders.filter((order) => order.status === "processing").length,
        shipped: orders.filter((order) => order.status === "shipped").length,
        delivered: orders.filter((order) => order.status === "delivered").length,
        cancelled: orders.filter((order) => order.status === "cancelled").length,
      };
      setOrderStats(stats);

      // Calculate revenue by month (last 6 months)
      const today = new Date();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const revenueByMonth = [];

      for (let i = 5; i >= 0; i--) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = monthNames[month.getMonth()];
        const monthOrders = orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getMonth() === month.getMonth() && orderDate.getFullYear() === month.getFullYear();
        });
        const revenue = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        revenueByMonth.push({
          name: monthName,
          revenue: revenue,
        });
      }
      setRevenueData(revenueByMonth);
    }
  }, [orders]);

  useEffect(() => {
    if (products && products.length > 0) {
      // Get top 5 products by stock
      const topProducts = [...products]
        .sort((a, b) => b.stock - a.stock)
        .slice(0, 5)
        .map((product) => ({
          name: product.name,
          value: product.stock,
        }));
      setProductStats(topProducts);
    }
  }, [products]);

  // Colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{orderStats.total}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Processing Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{orderStats.processing}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Delivered Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{orderStats.delivered}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Revenue Chart */}
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Product Stock Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Product Stock Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {productStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value} units`, props.payload.name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Pending", value: orderStats.pending },
                    { name: "Processing", value: orderStats.processing },
                    { name: "Shipped", value: orderStats.shipped },
                    { name: "Delivered", value: orderStats.delivered },
                    { name: "Cancelled", value: orderStats.cancelled },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#FFBB28" />
                  <Cell fill="#00C49F" />
                  <Cell fill="#0088FE" />
                  <Cell fill="#8884D8" />
                  <Cell fill="#FF8042" />
                </Pie>
                <Tooltip formatter={(value) => [`${value} orders`]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard; 