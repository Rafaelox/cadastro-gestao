const express = require('express');
const { pool } = require('../index');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/categorias
router.get('/', async (req, res) => {
  const endpoint = req.originalUrl.split('/').pop();
  console.log(`🔍 Endpoint configuração: ${endpoint}`);
  
  switch (endpoint) {
    case 'categorias':
      return await getCategorias(req, res);
    case 'origens':
      return await getOrigens(req, res);
    case 'servicos':
      return await getServicos(req, res);
    case 'consultores':
      return await getConsultores(req, res);
    case 'formas-pagamento':
      return await getFormasPagamento(req, res);
    default:
      return res.status(404).json({ error: 'Endpoint não encontrado' });
  }
});

// GET /api/configuracao/categorias
async function getCategorias(req, res) {
  try {
    console.log('📋 Buscando categorias...');
    const result = await pool.query('SELECT * FROM categorias ORDER BY nome');
    console.log(`📋 Encontradas ${result.rows.length} categorias`);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

router.get('/categorias', getCategorias);

// GET /api/configuracao/origens
async function getOrigens(req, res) {
  try {
    const result = await pool.query('SELECT * FROM origens ORDER BY nome');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erro ao buscar origens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

router.get('/origens', getOrigens);

// GET /api/configuracao/servicos
async function getServicos(req, res) {
  try {
    const result = await pool.query('SELECT * FROM servicos ORDER BY nome');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

router.get('/servicos', getServicos);

// GET /api/configuracao/consultores
async function getConsultores(req, res) {
  try {
    const result = await pool.query('SELECT * FROM consultores ORDER BY nome');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erro ao buscar consultores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

router.get('/consultores', getConsultores);

// GET /api/configuracao/formas-pagamento
async function getFormasPagamento(req, res) {
  try {
    const result = await pool.query('SELECT * FROM formas_pagamento ORDER BY ordem');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erro ao buscar formas de pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

router.get('/formas-pagamento', getFormasPagamento);

module.exports = router;