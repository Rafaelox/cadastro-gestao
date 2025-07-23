const express = require('express');
const { pool } = require('../index');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/pagamentos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM pagamentos ORDER BY data_pagamento DESC'
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/pagamentos
router.post('/', async (req, res) => {
  try {
    const pagamento = req.body;

    const result = await pool.query(
      `INSERT INTO pagamentos (
        cliente_id, servico_id, valor, forma_pagamento_id,
        data_pagamento, observacoes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`,
      [
        pagamento.cliente_id,
        pagamento.servico_id,
        pagamento.valor,
        pagamento.forma_pagamento_id,
        pagamento.data_pagamento || new Date(),
        pagamento.observacoes,
        pagamento.status || 'pago'
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;