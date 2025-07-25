const express = require('express');
const { pool } = require('../index');
const { authenticateToken } = require('../middleware/auth');
const bcrypt = require('bcrypt');

const router = express.Router();
router.use(authenticateToken);

// GET /api/usuarios
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome, email, role, ativo, created_at, updated_at FROM usuarios ORDER BY nome'
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/usuarios/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, nome, email, role, ativo, created_at, updated_at FROM usuarios WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/usuarios
router.post('/', async (req, res) => {
  try {
    const { nome, email, senha, role } = req.body;
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);
    
    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, nome, email, role, ativo, created_at, updated_at`,
      [nome, email, hashedPassword, role || 'user']
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email já está em uso' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

// PUT /api/usuarios/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, role, ativo, senha } = req.body;
    
    let query = `UPDATE usuarios SET 
                 nome = $1, 
                 email = $2, 
                 role = $3, 
                 ativo = $4, 
                 updated_at = CURRENT_TIMESTAMP`;
    let params = [nome, email, role, ativo];
    
    if (senha) {
      const hashedPassword = await bcrypt.hash(senha, 10);
      query += `, senha = $5`;
      params.push(hashedPassword);
    }
    
    query += ` WHERE id = $${params.length + 1} RETURNING id, nome, email, role, ativo, created_at, updated_at`;
    params.push(id);

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email já está em uso' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

// DELETE /api/usuarios/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM usuarios WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;