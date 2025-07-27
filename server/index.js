const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool, testConnection, closeConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('ERRO: JWT_SECRET não está definido nas variáveis de ambiente');
  process.exit(1);
}

// Trust proxy for EasyPanel
app.set('trust proxy', true);

// CORS Configuration with debug logging
const corsOptions = {
  origin: function (origin, callback) {
    console.log(`🌐 CORS Request from origin: ${origin || 'NO ORIGIN'}`);
    
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [
          'https://gest.rpedro.pro',
          'http://gest.rpedro.pro',
          'http://localhost:3000',
          'http://localhost:5173',
          process.env.DOMAIN
        ].filter(Boolean)
      : ['http://localhost:3000', 'http://localhost:5173'];
    
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS: Origin ${origin} is allowed`);
      callback(null, true);
    } else {
      console.log(`❌ CORS: Origin ${origin} is NOT allowed. Allowed origins:`, allowedOrigins);
      // Temporarily allow all origins for debugging
      console.log('🔧 DEBUG: Allowing all origins temporarily');
      callback(null, true);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Enhanced request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const forwardedFor = req.get('X-Forwarded-For');
  const host = req.get('Host');
  
  console.log(`📥 ${req.method} ${req.path} - ${timestamp}`);
  console.log(`🔍 Client IP: ${clientIP}`);
  if (forwardedFor) console.log(`🔍 X-Forwarded-For: ${forwardedFor}`);
  console.log(`🔍 Host: ${host}`);
  console.log(`🔍 User-Agent: ${userAgent}`);
  console.log(`🔍 Origin: ${req.get('Origin') || 'NO ORIGIN'}`);
  console.log(`🔍 Referer: ${req.get('Referer') || 'NO REFERER'}`);
  
  // Add security headers
  res.set({
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });
  
  next();
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const result = await pool.query('SELECT 1');
    const clientIP = req.ip || req.connection.remoteAddress;
    
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
      clientIP,
      host: req.get('Host'),
      userAgent: req.get('User-Agent'),
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Health check failed:', error.message);
    res.status(503).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// Debug endpoint
app.get('/debug', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    host: req.get('Host'),
    origin: req.get('Origin'),
    userAgent: req.get('User-Agent'),
    clientIP: req.ip || req.connection.remoteAddress,
    headers: req.headers,
    url: req.url,
    method: req.method
  });
});

// API Routes
app.use('/api', require('./routes'));

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../dist')));

// Serve React app for all other routes (non-API)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Test initial database connection with retry
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Falha crítica na conexão com banco de dados. Encerrando...');
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Encerrando servidor...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 Encerrando servidor...');
  await closeConnection();
  process.exit(0);
});

module.exports = { app };