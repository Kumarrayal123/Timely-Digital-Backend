import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import leadRoutes from './routes/leadRoutes.js';
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { initAdminUser } from './controllers/authController.js';
import { initDefaultBlogs } from './controllers/blogController.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB and seed initial data
connectDB().then(async () => {
  await initAdminUser();
  await initDefaultBlogs();
});

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - Allow all origins and headers
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: '*',
  })
);
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root & Health check routes
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Timely Digital API',
    status: 'online',
    version: '1.0.0',
    description: 'Backend API service for Timely Digital marketing website',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/login',
      consultationLeads: '/api/consultation-leads',
      leadStats: '/api/consultation-leads/stats',
      blogs: '/api/blogs',
    },
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Timely Digital Backend',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/consultation-leads', leadRoutes);
app.use('/api/leads', leadRoutes); // Alias
app.use('/api/blogs', blogRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found.`,
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start Server when run directly
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Timely Digital Server running on port ${PORT}`);
  console.log(`📡 Local: http://localhost:${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api/consultation-leads`);
  console.log(`===============================================`);
});

export default app;
