import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { generalLimiter } from './middleware/rateLimiter.js';
import aiRoutes from './routes/ai.js';
import blockchainRoutes from './routes/blockchain.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ============ Security Middleware ============
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for API server
  crossOriginEmbedderPolicy: false,
}));

// ============ CORS ============
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  })
);

// ============ Logging ============
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ============ Body Parsing ============
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ============ General Rate Limiter ============
app.use(generalLimiter);

// ============ Health Check ============
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'NexDeFi Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: {
      ai: !!process.env.OPENAI_API_KEY,
      blockchain: !!(process.env.SEPOLIA_RPC_URL && !process.env.SEPOLIA_RPC_URL.includes('placeholder')),
    },
  });
});

// ============ API Routes ============
app.use('/api/ai', aiRoutes);
app.use('/api/blockchain', blockchainRoutes);

// ============ 404 Handler ============
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    code: 'NOT_FOUND',
    path: req.path,
    available: ['/api/health', '/api/ai/chat', '/api/ai/insights', '/api/blockchain/info/:address', '/api/blockchain/gas'],
  });
});

// ============ Global Error Handler ============
app.use((err, req, res, next) => {
  // CORS error
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'CORS policy violation',
      code: 'CORS_ERROR',
    });
  }

  // JSON parse error
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON in request body',
      code: 'INVALID_JSON',
    });
  }

  // Payload too large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Request body too large (max 10kb)',
      code: 'PAYLOAD_TOO_LARGE',
    });
  }

  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
});

// ============ Start Server ============
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔═══════════════════════════════════╗');
  console.log('  ║     NexDeFi Backend API v1.0.0    ║');
  console.log('  ╚═══════════════════════════════════╝');
  console.log('');
  console.log(`  Server:      http://localhost:${PORT}`);
  console.log(`  Health:      http://localhost:${PORT}/api/health`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log(`  OpenAI:      ${process.env.OPENAI_API_KEY ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`  Blockchain:  ${process.env.SEPOLIA_RPC_URL && !process.env.SEPOLIA_RPC_URL.includes('placeholder') ? '✓ Configured' : '✗ Not configured'}`);
  console.log('');
});

export default app;
