const express = require('express');
const { pool } = require('../index');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/audit_logs
router.get('/', async (req, res) => {
  try {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (req.query.dataInicio) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(`${req.query.dataInicio} 00:00:00`);
      paramIndex++;
    }

    if (req.query.dataFim) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(`${req.query.dataFim} 23:59:59`);
      paramIndex++;
    }

    if (req.query.tabela) {
      query += ` AND table_name = $${paramIndex}`;
      params.push(req.query.tabela);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC LIMIT 100';

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar audit logs:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;