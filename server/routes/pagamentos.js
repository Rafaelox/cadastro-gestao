const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/pagamentos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        c.nome as cliente_nome,
        s.nome as servico_nome,
        s.valor as valor_original,
        cons.nome as consultor_nome,
        fp.nome as forma_pagamento_nome,
        1 as numero_parcelas
      FROM pagamentos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      LEFT JOIN servicos s ON p.servico_id = s.id
      LEFT JOIN consultores cons ON s.consultor_id = cons.id
      LEFT JOIN formas_pagamento fp ON p.forma_pagamento_id = fp.id
      ORDER BY p.data_pagamento DESC
    `);
    
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