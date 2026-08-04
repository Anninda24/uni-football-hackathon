import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { initSocket } from './socket.js';
import authRoutes       from './routes/authRoutes.js';
import adminRoutes      from './routes/adminRoutes.js';
import playerRoutes     from './routes/playerRoutes.js';
import tournamentRoutes from './routes/tournamentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/player',     playerRoutes);
app.use('/api/tournament', tournamentRoutes);

// Health Check
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
    message: err.message || 'Internal server error'
  });
});

// ── HTTP + Socket.IO Server ────────────────────────────────────────────────────
const httpServer = http.createServer(app);
const io = initSocket(httpServer);

// Make `io` accessible inside route handlers via req.app.get('io')
app.set('io', io);

httpServer.listen(PORT, () => {
  console.log(`⚽ Express Server & Socket.IO running on http://localhost:${PORT}`);
});

export default app;
