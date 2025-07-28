const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { pool } = require('../config/database');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    console.log('🔐 Tentativa de login para:', email);

    // Buscar usuário no banco
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1 AND ativo = true',
      [email]
    );
    
    console.log('👤 Usuários encontrados:', result.rows.length);

    if (result.rows.length === 0) {
      console.log('❌ Usuário não encontrado ou inativo');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const usuario = result.rows[0];
    console.log('🔍 Usuário encontrado:', { id: usuario.id, email: usuario.email, ativo: usuario.ativo });

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    console.log('🔑 Senha válida:', senhaValida);
    
    if (!senhaValida) {
      console.log('❌ Senha incorreta');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: usuario.id,
        email: usuario.email,
        perfil: usuario.perfil
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Login bem-sucedido para:', email);
    
    res.json({
      success: true,
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verificar token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar dados atualizados do usuário
    const result = await pool.query(
      'SELECT id, nome, email, perfil FROM usuarios WHERE id = $1 AND ativo = true',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      success: true,
      usuario: result.rows[0]
    });

  } catch (error) {
    console.error('Erro na verificação do token:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;