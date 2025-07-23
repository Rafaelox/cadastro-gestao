const express = require('express');
const { pool } = require('../index');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/agenda
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM agenda ORDER BY data_agendamento DESC'
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar agenda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/agenda
router.post('/', async (req, res) => {
  try {
    const agenda = req.body;

    const result = await pool.query(
      `INSERT INTO agenda (
        cliente_id, servico_id, consultor_id, data_agendamento,
        observacoes, status
      ) VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`,
      [
        agenda.cliente_id,
        agenda.servico_id,
        agenda.consultor_id,
        agenda.data_agendamento,
        agenda.observacoes,
        agenda.status || 'agendado'
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;