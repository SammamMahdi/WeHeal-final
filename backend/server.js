import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import path from "path";
import http from "http";

import { connectDB } from "./db/connectDB.js";
import { initializeSocket } from "./socket.js";

import authRoutes from "./routes/authRoute.js";
import adminRoutes from "./routes/adminRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import videoCallRoutes from "./routes/videoCallRoutes.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import shopProductsRouter from './routes/shop/products-routes.js';
import shopCartRouter from './routes/shop/cart-routes.js';
import shopAddressRouter from './routes/shop/address-routes.js';
import shopOrderRouter from './routes/shop/order-routes.js';
import shopReviewRouter from './routes/shop/review-routes.js';
import shopSearchRouter from './routes/shop/search-routes.js';
import shopLabTestsRouter from './routes/shop/lab-tests-routes.js';
import shopLabOrdersRouter from './routes/shop/lab-orders-routes.js';
import commonFeatureRouter from './routes/common/feature-routes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// Initialize Socket.IO
const io = initializeSocket(server);

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5174",
      "http://localhost:5175",
      'https://weheal-1.onrender.com',
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Add request logging middleware
app.use((req, res, next) => {
  console.log("=== Incoming Request ===");
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Headers:", req.headers);
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/video-call", videoCallRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/shop/products', shopProductsRouter);
app.use('/api/shop/cart', shopCartRouter);
app.use('/api/shop/address', shopAddressRouter);
app.use('/api/shop/order', shopOrderRouter);
app.use('/api/shop/review', shopReviewRouter);
app.use('/api/shop/search', shopSearchRouter);
app.use('/api/lab-tests', shopLabTestsRouter);
app.use('/api/lab-orders', shopLabOrdersRouter);
app.use('/api/common/feature', commonFeatureRouter);

// Production static files
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
server.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port: ${PORT}`);
  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});
