const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool, testConnection, closeConnection } = require('./config/database');

// Enhanced error handling
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error('💥 Error:', err.message);
  console.error('💥 Stack:', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...');
  console.error('💥 Reason:', reason);
  console.error('💥 Promise:', promise);
  process.exit(1);
});

// Startup logging
console.log('🔧 Inicializando servidor...');
console.log('🔧 Node.js version:', process.version);
console.log('🔧 Environment variables:');
console.log('   - NODE_ENV:', process.env.NODE_ENV);
console.log('   - PORT:', process.env.PORT);
console.log('   - DB_HOST:', process.env.DB_HOST);
console.log('   - DB_PORT:', process.env.DB_PORT);
console.log('   - DB_NAME:', process.env.DB_NAME);
console.log('   - DB_USER:', process.env.DB_USER);
console.log('   - DB_PASSWORD:', process.env.DB_PASSWORD ? '[DEFINED]' : '[NOT DEFINED]');
console.log('   - JWT_SECRET:', process.env.JWT_SECRET ? '[DEFINED]' : '[NOT DEFINED]');
console.log('   - DOMAIN:', process.env.DOMAIN);

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

// Enhanced health check with detailed logging
app.get('/health', async (req, res) => {
  console.log('🏥 Health check requested');
  
  try {
    console.log('🏥 Testing database connection...');
    const startTime = Date.now();
    const result = await pool.query('SELECT 1, NOW() as server_time');
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`🏥 Database query successful in ${responseTime}ms`);
    
    const clientIP = req.ip || req.connection.remoteAddress;
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        responseTime: `${responseTime}ms`,
        serverTime: result.rows[0].server_time
      },
      server: {
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid
      },
      request: {
        clientIP,
        host: req.get('Host'),
        userAgent: req.get('User-Agent')
      },
      version: '1.0.0'
    };
    
    console.log('🏥 Health check successful');
    res.status(200).json(health);
  } catch (error) {
    console.error('🏥 Health check failed:', error.message);
    console.error('🏥 Error stack:', error.stack);
    
    const errorResponse = {
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: {
        status: 'disconnected',
        error: error.message
      },
      server: {
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid
      },
      version: '1.0.0'
    };
    
    res.status(503).json(errorResponse);
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

// External test endpoint for debugging
app.get('/external-test', (req, res) => {
  console.log('🌍 External test endpoint called');
  console.log('🔍 Headers:', JSON.stringify(req.headers, null, 2));
  console.log('🔍 Connection info:', {
    remoteAddress: req.connection?.remoteAddress,
    remotePort: req.connection?.remotePort,
    localAddress: req.connection?.localAddress,
    localPort: req.connection?.localPort
  });
  
  res.json({
    message: 'External access working!',
    timestamp: new Date().toISOString(),
    requestInfo: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      ip: req.ip,
      ips: req.ips,
      hostname: req.hostname,
      protocol: req.protocol,
      secure: req.secure,
      originalUrl: req.originalUrl
    },
    serverInfo: {
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
      host: req.get('Host'),
      userAgent: req.get('User-Agent')
    }
  });
});

// Start server with enhanced logging and error handling
console.log('🚀 Iniciando servidor HTTP...');

const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT} em todas as interfaces (0.0.0.0)`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URLs de acesso:`);
  console.log(`   - Local: http://localhost:${PORT}`);
  console.log(`   - Rede: http://0.0.0.0:${PORT}`);
  console.log(`   - Health: http://0.0.0.0:${PORT}/health`);
  console.log(`   - Debug: http://0.0.0.0:${PORT}/debug`);
  console.log(`   - External Test: http://0.0.0.0:${PORT}/external-test`);
  if (process.env.DOMAIN) {
    console.log(`   - Domínio: ${process.env.DOMAIN}`);
  }
  
  console.log('🔌 Testando conexão com banco de dados...');
  
  // Test initial database connection with enhanced retry logic
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ FALHA CRÍTICA: Não foi possível conectar ao banco de dados após várias tentativas');
    console.error('❌ Verifique as variáveis de ambiente do banco de dados');
    console.error('❌ DB_HOST:', process.env.DB_HOST);
    console.error('❌ DB_PORT:', process.env.DB_PORT);
    console.error('❌ DB_NAME:', process.env.DB_NAME);
    console.error('❌ DB_USER:', process.env.DB_USER);
    console.error('❌ Encerrando servidor...');
    process.exit(1);
  }
  
  console.log('✅ Servidor HTTP pronto para receber conexões externas');
  console.log('✅ Banco de dados conectado com sucesso');
  console.log('✅ Sistema inicializado completamente');
  
  // Log server configuration
  console.log('📋 Configuração do servidor:');
  console.log(`   - PID: ${process.pid}`);
  console.log(`   - Uptime: ${process.uptime()}s`);
  console.log(`   - Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
  console.log(`   - Platform: ${process.platform}`);
  console.log(`   - Architecture: ${process.arch}`);
});

// Handle server startup errors
server.on('error', (error) => {
  console.error('💥 Erro ao iniciar servidor:', error.message);
  console.error('💥 Stack:', error.stack);
  
  if (error.code === 'EADDRINUSE') {
    console.error(`💥 Porta ${PORT} já está em uso`);
  } else if (error.code === 'EACCES') {
    console.error(`💥 Permissão negada para a porta ${PORT}`);
  }
  
  process.exit(1);
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