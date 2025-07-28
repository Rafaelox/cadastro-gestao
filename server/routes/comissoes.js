const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/comissoes
router.get('/', async (req, res) => {
  try {
    let query = 'SELECT * FROM comissoes WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (req.query.consultor_id) {
      query += ` AND consultor_id = $${paramIndex}`;
      params.push(req.query.consultor_id);
      paramIndex++;
    }

    if (req.query.data_inicio) {
      query += ` AND data_operacao >= $${paramIndex}`;
      params.push(req.query.data_inicio);
      paramIndex++;
    }

    if (req.query.data_fim) {
      query += ` AND data_operacao <= $${paramIndex}`;
      params.push(req.query.data_fim);
      paramIndex++;
    }

    query += ' ORDER BY data_operacao DESC';

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar comissões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;