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

// Complete CRUD for clientes
app.get('/api/clientes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT c.*, cat.nome as categoria_nome, ori.nome as origem_nome
      FROM clientes c
      LEFT JOIN categorias cat ON c.categoria_id = cat.id
      LEFT JOIN origens ori ON c.origem_id = ori.id
      WHERE c.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/clientes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome, data_nascimento, cpf, cep, endereco, telefone, email,
      categoria_id, origem_id, ativo, recebe_email, recebe_whatsapp, recebe_sms
    } = req.body;
    
    const result = await pool.query(`
      UPDATE clientes SET
        nome = $1, data_nascimento = $2, cpf = $3, cep = $4, endereco = $5,
        telefone = $6, email = $7, categoria_id = $8, origem_id = $9,
        ativo = $10, recebe_email = $11, recebe_whatsapp = $12, recebe_sms = $13,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *
    `, [
      nome, data_nascimento, cpf, cep, endereco, telefone, email,
      categoria_id, origem_id, ativo, recebe_email, recebe_whatsapp, recebe_sms, id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/clientes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete CRUD for categorias
app.post('/api/categorias', authenticateToken, async (req, res) => {
  try {
    const { nome, descricao, ativo } = req.body;
    const result = await pool.query(`
      INSERT INTO categorias (nome, descricao, ativo)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [nome, descricao, ativo]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/categorias/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, ativo } = req.body;
    const result = await pool.query(`
      UPDATE categorias SET nome = $1, descricao = $2, ativo = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [nome, descricao, ativo, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/categorias/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM categorias WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    
    res.json({ message: 'Categoria deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete CRUD for origens
app.post('/api/origens', authenticateToken, async (req, res) => {
  try {
    const { nome, descricao, ativo } = req.body;
    const result = await pool.query(`
      INSERT INTO origens (nome, descricao, ativo)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [nome, descricao, ativo]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/origens/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, ativo } = req.body;
    const result = await pool.query(`
      UPDATE origens SET nome = $1, descricao = $2, ativo = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [nome, descricao, ativo, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Origem não encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/origens/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM origens WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Origem não encontrada' });
    }
    
    res.json({ message: 'Origem deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Estatísticas
app.get('/api/estatisticas', authenticateToken, async (req, res) => {
  try {
    const totalClientes = await pool.query('SELECT COUNT(*) as total FROM clientes');
    const clientesAtivos = await pool.query('SELECT COUNT(*) as total FROM clientes WHERE ativo = true');
    const clientesInativos = await pool.query('SELECT COUNT(*) as total FROM clientes WHERE ativo = false');
    
    const porCategoria = await pool.query(`
      SELECT cat.nome as categoria, COUNT(c.id) as total
      FROM categorias cat
      LEFT JOIN clientes c ON c.categoria_id = cat.id
      GROUP BY cat.id, cat.nome
      ORDER BY total DESC
    `);
    
    const porOrigem = await pool.query(`
      SELECT ori.nome as origem, COUNT(c.id) as total
      FROM origens ori
      LEFT JOIN clientes c ON c.origem_id = ori.id
      GROUP BY ori.id, ori.nome
      ORDER BY total DESC
    `);
    
    res.json({
      total_clientes: parseInt(totalClientes.rows[0].total),
      clientes_ativos: parseInt(clientesAtivos.rows[0].total),
      clientes_inativos: parseInt(clientesInativos.rows[0].total),
      por_categoria: porCategoria.rows,
      por_origem: porOrigem.rows
    });
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