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
  res.json({ message: 'API funcionando!', timestamp: new Date().toISOString() });
});

module.exports = router;