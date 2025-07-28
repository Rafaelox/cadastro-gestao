const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/historico
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM historico ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/historico
router.post('/', async (req, res) => {
  try {
    const historico = req.body;

    const result = await pool.query(
      `INSERT INTO historico (
        cliente_id, tipo, descricao, data_evento, usuario_id
      ) VALUES ($1, $2, $3, $4, $5) 
      RETURNING *`,
      [
        historico.cliente_id,
        historico.tipo,
        historico.descricao,
        historico.data_evento || new Date(),
        req.user.userId
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar histórico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;