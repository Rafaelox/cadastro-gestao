// Backend Node.js para conectar ao PostgreSQL na VPS
// Execute: npm install express cors pg bcrypt jsonwebtoken dotenv
// Execute: node backend/server.js

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Configuração do PostgreSQL - Configure estas variáveis no seu .env
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sistema_cadastro',
  password: process.env.DB_PASSWORD || 'sua_senha',
  port: process.env.DB_PORT || 5432,
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta', (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// ROTAS DE AUTENTICAÇÃO
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE username = $1 AND ativo = true',
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }
    
    // Atualizar último login
    await pool.query(
      'UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );
    
    const token = jwt.sign(
      { id: user.id, username: user.username, tipo_usuario: user.tipo_usuario },
      process.env.JWT_SECRET || 'sua_chave_secreta',
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        nome: user.nome,
        email: user.email,
        tipo_usuario: user.tipo_usuario
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ROTAS DE CLIENTES
app.get('/api/clientes', authenticateToken, async (req, res) => {
  try {
    const { nome, cpf, email, categoria_id, origem_id, ativo, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT c.*, cat.nome as categoria_nome, ori.nome as origem_nome
      FROM clientes c
      LEFT JOIN categorias cat ON c.categoria_id = cat.id
      LEFT JOIN origens ori ON c.origem_id = ori.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;
    
    if (nome) {
      paramCount++;
      query += ` AND c.nome ILIKE $${paramCount}`;
      params.push(`%${nome}%`);
    }
    
    if (cpf) {
      paramCount++;
      query += ` AND c.cpf = $${paramCount}`;
      params.push(cpf);
    }
    
    if (email) {
      paramCount++;
      query += ` AND c.email ILIKE $${paramCount}`;
      params.push(`%${email}%`);
    }
    
    if (categoria_id) {
      paramCount++;
      query += ` AND c.categoria_id = $${paramCount}`;
      params.push(categoria_id);
    }
    
    if (origem_id) {
      paramCount++;
      query += ` AND c.origem_id = $${paramCount}`;
      params.push(origem_id);
    }
    
    if (ativo !== undefined) {
      paramCount++;
      query += ` AND c.ativo = $${paramCount}`;
      params.push(ativo === 'true');
    }
    
    query += ` ORDER BY c.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clientes', authenticateToken, async (req, res) => {
  try {
    const {
      nome, data_nascimento, cpf, cep, endereco, telefone, email,
      categoria_id, origem_id, ativo, recebe_email, recebe_whatsapp, recebe_sms
    } = req.body;
    
    const result = await pool.query(`
      INSERT INTO clientes (
        nome, data_nascimento, cpf, cep, endereco, telefone, email,
        categoria_id, origem_id, ativo, recebe_email, recebe_whatsapp, recebe_sms
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      nome, data_nascimento, cpf, cep, endereco, telefone, email,
      categoria_id, origem_id, ativo, recebe_email, recebe_whatsapp, recebe_sms
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ROTAS DE CATEGORIAS E ORIGENS (similar pattern)
app.get('/api/categorias', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias ORDER BY nome');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/origens', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM origens ORDER BY nome');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`API disponível em: http://localhost:${PORT}/api`);
});

module.exports = app;