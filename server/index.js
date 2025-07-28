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
const PORT = process.env.PORT || 80;

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

// Simple health check endpoint (always returns OK for Docker)
app.get('/health/simple', (req, res) => {
  console.log('🏥 Simple health check requested');
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Enhanced health check with database testing
app.get('/health', async (req, res) => {
  console.log('🏥 Full health check requested');
  
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'unknown',
    environment: process.env.NODE_ENV || 'development',
    config: {
      db_host: process.env.DB_HOST,
      db_port: process.env.DB_PORT,
      db_name: process.env.DB_NAME,
      db_user: process.env.DB_USER,
      db_password_set: !!process.env.DB_PASSWORD,
      jwt_secret_set: !!process.env.JWT_SECRET
    },
    server: {
      memory: process.memoryUsage(),
      pid: process.pid,
      port: PORT,
      host: req.get('Host')
    }
  };

  try {
    // Test database connection with timeout
    console.log('🏥 Testing database connection...');
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database timeout')), 5000)
    );
    
    const dbPromise = pool.query('SELECT 1, NOW() as server_time');
    const result = await Promise.race([dbPromise, timeoutPromise]);
    
    healthStatus.database = 'connected';
    healthStatus.database_time = result.rows[0].server_time;
    console.log('🏥 Database connection successful');
    res.status(200).json(healthStatus);
  } catch (error) {
    console.error('🏥 Database connection warning:', error.message);
    healthStatus.database = 'disconnected';
    healthStatus.database_error = error.message;
    // Return 200 for partial health - service is up even if DB is down
    res.status(200).json(healthStatus);
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

// Status endpoint for detailed diagnostics
app.get('/status', async (req, res) => {
  console.log('📊 Status endpoint requested');
  
  const status = {
    timestamp: new Date().toISOString(),
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      pid: process.pid,
      platform: process.platform,
      arch: process.arch,
      node_version: process.version,
      environment: process.env.NODE_ENV || 'development'
    },
    configuration: {
      port: PORT,
      host: req.get('Host'),
      db_host: process.env.DB_HOST,
      db_port: process.env.DB_PORT,
      db_name: process.env.DB_NAME,
      db_user: process.env.DB_USER,
      db_password_configured: !!process.env.DB_PASSWORD,
      jwt_secret_configured: !!process.env.JWT_SECRET,
      domain: process.env.DOMAIN
    },
    request_info: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      user_agent: req.get('User-Agent'),
      origin: req.get('Origin'),
      referer: req.get('Referer')
    }
  };

  // Test database connectivity
  try {
    console.log('📊 Testing database for status check...');
    const dbResult = await pool.query('SELECT NOW() as db_time, version() as db_version');
    status.database = {
      status: 'connected',
      server_time: dbResult.rows[0].db_time,
      version: dbResult.rows[0].db_version
    };
    console.log('📊 Database connection successful');
  } catch (error) {
    console.error('📊 Database connection failed:', error.message);
    status.database = {
      status: 'disconnected',
      error: error.message,
      code: error.code
    };
  }

  res.json(status);
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

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT} em todas as interfaces (0.0.0.0)`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URLs de acesso:`);
  console.log(`   - Local: http://localhost:${PORT}`);
  console.log(`   - Rede: http://0.0.0.0:${PORT}`);
  console.log(`   - Health: http://0.0.0.0:${PORT}/health`);
  console.log(`   - Simple Health: http://0.0.0.0:${PORT}/health/simple`);
  console.log(`   - Debug: http://0.0.0.0:${PORT}/debug`);
  console.log(`   - External Test: http://0.0.0.0:${PORT}/external-test`);
  if (process.env.DOMAIN) {
    console.log(`   - Domínio: ${process.env.DOMAIN}`);
  }
  
  console.log('✅ Servidor HTTP pronto para receber conexões');
  
  // Test database connection in background (non-blocking)
  setTimeout(async () => {
    try {
      console.log('🔌 Testando conexão com banco de dados...');
      const connected = await testConnection(3); // Reduced retries for faster startup
      if (connected) {
        console.log('✅ Banco de dados conectado com sucesso');
      } else {
        console.log('⚠️  Servidor rodando sem banco - tentará reconectar automaticamente');
        
        // Schedule retry in 30 seconds
        setTimeout(() => {
          console.log('🔄 Tentando reconectar ao banco...');
          testConnection(2).then((reconnected) => {
            if (reconnected) {
              console.log('✅ Banco de dados reconectado');
            } else {
              console.log('⚠️  Falha na reconexão - verificar configuração de banco');
            }
          });
        }, 30000);
      }
    } catch (error) {
      console.error('❌ Erro durante teste de banco:', error.message);
    }
  }, 1000);
  
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