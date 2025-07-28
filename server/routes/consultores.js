const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/consultores
router.get('/', async (req, res) => {
  console.log('🎯 SERVER: Route /consultores called');
  try {
    const result = await pool.query('SELECT * FROM consultores ORDER BY nome');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar consultores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/consultores
router.post('/', async (req, res) => {
  try {
    const { nome, email, telefone, ativo } = req.body;
    
    const result = await pool.query(
      'INSERT INTO consultores (nome, email, telefone, ativo) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, email, telefone, ativo ?? true]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar consultor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/consultores/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, ativo } = req.body;
    
    const result = await pool.query(
      'UPDATE consultores SET nome = $1, email = $2, telefone = $3, ativo = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [nome, email, telefone, ativo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Consultor não encontrado' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar consultor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/consultores/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM consultores WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Consultor não encontrado' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao deletar consultor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;