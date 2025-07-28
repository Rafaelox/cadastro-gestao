const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/origens
router.get('/', async (req, res) => {
  console.log('🎯 SERVER: Route /origens called');
  try {
    const result = await pool.query('SELECT * FROM origens ORDER BY nome');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar origens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/origens
router.post('/', async (req, res) => {
  try {
    const { nome, descricao, ativo } = req.body;
    
    const result = await pool.query(
      'INSERT INTO origens (nome, descricao, ativo) VALUES ($1, $2, $3) RETURNING *',
      [nome, descricao, ativo ?? true]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar origem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/origens/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, ativo } = req.body;
    
    const result = await pool.query(
      'UPDATE origens SET nome = $1, descricao = $2, ativo = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [nome, descricao, ativo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Origem não encontrada' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar origem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/origens/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM origens WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Origem não encontrada' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao deletar origem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;