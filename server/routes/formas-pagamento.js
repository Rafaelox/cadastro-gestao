const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/formas-pagamento
router.get('/', async (req, res) => {
  console.log('🎯 SERVER: Route /formas-pagamento called');
  try {
    const result = await pool.query('SELECT * FROM formas_pagamento ORDER BY ordem, nome');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar formas de pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/formas-pagamento
router.post('/', async (req, res) => {
  try {
    const { nome, ordem, ativo } = req.body;
    
    const result = await pool.query(
      'INSERT INTO formas_pagamento (nome, ordem, ativo) VALUES ($1, $2, $3) RETURNING *',
      [nome, ordem || 0, ativo ?? true]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar forma de pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/formas-pagamento/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, ordem, ativo } = req.body;
    
    const result = await pool.query(
      'UPDATE formas_pagamento SET nome = $1, ordem = $2, ativo = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [nome, ordem, ativo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Forma de pagamento não encontrada' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar forma de pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/formas-pagamento/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM formas_pagamento WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Forma de pagamento não encontrada' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao deletar forma de pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;