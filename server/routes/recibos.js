const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/recibos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, c.nome as cliente_nome, s.nome as servico_nome 
      FROM recibos r
      LEFT JOIN clientes c ON r.cliente_id = c.id
      LEFT JOIN servicos s ON r.servico_id = s.id
      ORDER BY r.created_at DESC
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar recibos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/recibos
router.post('/', async (req, res) => {
  try {
    const { cliente_id, servico_id, valor, descricao } = req.body;
    
    // Gerar número do recibo
    const numeroRecibo = `REC-${Date.now()}`;

    const result = await pool.query(
      `INSERT INTO recibos (
        cliente_id, servico_id, valor, descricao, numero_recibo
      ) VALUES ($1, $2, $3, $4, $5) 
      RETURNING *`,
      [cliente_id, servico_id, valor, descricao, numeroRecibo]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar recibo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;