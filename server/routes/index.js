const express = require('express');
const router = express.Router();

// Import route modules
const clientesRoutes = require('./clientes');
const agendaRoutes = require('./agenda');
const historicoRoutes = require('./historico');
const pagamentosRoutes = require('./pagamentos');
const configuracaoRoutes = require('./configuracao');
const authRoutes = require('./auth');
const usuariosRoutes = require('./usuarios');
const recibosRoutes = require('./recibos');
const auditLogsRoutes = require('./audit_logs');
const comissoesRoutes = require('./comissoes');

// Use routes
router.use('/auth', authRoutes);
router.use('/clientes', clientesRoutes);
router.use('/agenda', agendaRoutes);
router.use('/historico', historicoRoutes);
router.use('/pagamentos', pagamentosRoutes);
router.use('/configuracao', configuracaoRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/recibos', recibosRoutes);
router.use('/audit_logs', auditLogsRoutes);
router.use('/comissoes', comissoesRoutes);

// Test route
router.get('/test', (req, res) => {
  console.log('🧪 Rota /test chamada');
  res.json({ 
    message: 'API funcionando!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    server: 'PostgreSQL Backend'
  });
});

// Diagnostic route
router.get('/diagnostic', async (req, res) => {
  console.log('🔍 Rota /diagnostic chamada');
  try {
    // Test database connection
    const { Pool } = require('pg');
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'InfoDB',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
    });
    
    await pool.query('SELECT 1');
    await pool.end();
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      server: 'PostgreSQL Backend',
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '5432',
        database: process.env.DB_NAME || 'InfoDB'
      },
      routes: ['/test', '/diagnostic', '/health']
    });
  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        status: 'error',
        error: error.message
      }
    });
  }
});

module.exports = router;