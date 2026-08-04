import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON Body Parsing
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'University Football Platform Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`⚽ Express Backend Server running on http://localhost:${PORT}`);
});

export default app;
