const express = require('express');
const { pool } = require('../index');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/configuracao/categorias
router.get('/categorias', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias ORDER BY nome');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/configuracao/origens
router.get('/origens', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM origens ORDER BY nome');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erro ao buscar origens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/configuracao/servicos
router.get('/servicos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM servicos ORDER BY nome');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/configuracao/consultores
router.get('/consultores', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM consultores ORDER BY nome');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erro ao buscar consultores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/configuracao/formas-pagamento
router.get('/formas-pagamento', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM formas_pagamento ORDER BY ordem');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erro ao buscar formas de pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;