const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// GET /api/clientes
router.get('/', async (req, res) => {
  try {
    const { 
      nome, cpf, email, telefone, 
      categoria_id, origem_id, ativo,
      limit = 50, offset = 0,
      orderBy = 'created_at', orderDirection = 'desc'
    } = req.query;

    let query = 'SELECT * FROM clientes WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Aplicar filtros
    if (nome) {
      paramCount++;
      query += ` AND nome ILIKE $${paramCount}`;
      params.push(`%${nome}%`);
    }

    if (cpf) {
      paramCount++;
      query += ` AND cpf ILIKE $${paramCount}`;
      params.push(`%${cpf}%`);
    }

    if (email) {
      paramCount++;
      query += ` AND email ILIKE $${paramCount}`;
      params.push(`%${email}%`);
    }

    if (telefone) {
      paramCount++;
      query += ` AND telefone ILIKE $${paramCount}`;
      params.push(`%${telefone}%`);
    }

    if (categoria_id) {
      paramCount++;
      query += ` AND categoria_id = $${paramCount}`;
      params.push(categoria_id);
    }

    if (origem_id) {
      paramCount++;
      query += ` AND origem_id = $${paramCount}`;
      params.push(origem_id);
    }

    if (ativo !== undefined) {
      paramCount++;
      query += ` AND ativo = $${paramCount}`;
      params.push(ativo === 'true');
    }

    // Aplicar ordenação
    const validOrderFields = ['nome', 'email', 'created_at', 'updated_at'];
    const orderField = validOrderFields.includes(orderBy) ? orderBy : 'created_at';
    const direction = orderDirection === 'asc' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY ${orderField} ${direction}`;

    // Aplicar paginação
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(parseInt(limit));

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(parseInt(offset));

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/clientes/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM clientes WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/clientes
router.post('/', async (req, res) => {
  try {
    const cliente = req.body;

    const result = await pool.query(
      `INSERT INTO clientes (
        nome, email, telefone, cpf, endereco, 
        categoria_id, origem_id, observacoes, ativo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [
        cliente.nome,
        cliente.email,
        cliente.telefone,
        cliente.cpf,
        cliente.endereco,
        cliente.categoria_id,
        cliente.origem_id,
        cliente.observacoes,
        cliente.ativo !== false
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/clientes/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = req.body;

    const result = await pool.query(
      `UPDATE clientes SET 
        nome = $1, email = $2, telefone = $3, cpf = $4, 
        endereco = $5, categoria_id = $6, origem_id = $7, 
        observacoes = $8, ativo = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10 
      RETURNING *`,
      [
        cliente.nome,
        cliente.email,
        cliente.telefone,
        cliente.cpf,
        cliente.endereco,
        cliente.categoria_id,
        cliente.origem_id,
        cliente.observacoes,
        cliente.ativo,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/clientes/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM clientes WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({
      success: true,
      message: 'Cliente excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;