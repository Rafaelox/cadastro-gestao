const express = require('express');
const router = express.Router();

// Import route modules
const clientesRoutes = require('./clientes');
const agendaRoutes = require('./agenda');
const historicoRoutes = require('./historico');
const pagamentosRoutes = require('./pagamentos');
const configuracaoRoutes = require('./configuracao');
const authRoutes = require('./auth');

// Use routes
router.use('/auth', authRoutes);
router.use('/clientes', clientesRoutes);
router.use('/agenda', agendaRoutes);
router.use('/historico', historicoRoutes);
router.use('/pagamentos', pagamentosRoutes);
router.use('/configuracao', configuracaoRoutes);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'API funcionando!', timestamp: new Date().toISOString() });
});

module.exports = router;