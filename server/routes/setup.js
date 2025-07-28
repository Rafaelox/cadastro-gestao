const express = require('express');
const { pool } = require('../index');
const bcrypt = require('bcrypt');

const router = express.Router();

// POST /api/setup/create-master - Criar usuário master inicial
router.post('/create-master', async (req, res) => {
  try {
    console.log('🔧 Criando usuário master...');
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash('master123', 10);
    
    // Verificar se já existe um usuário master
    const existingMaster = await pool.query(
      'SELECT id FROM usuarios WHERE role = $1 LIMIT 1',
      ['admin']
    );
    
    if (existingMaster.rows.length > 0) {
      console.log('⚠️  Usuário master já existe, atualizando...');
      
      // Atualizar usuário existente
      const result = await pool.query(
        `UPDATE usuarios SET 
         nome = $1, 
         email = $2, 
         senha = $3, 
         role = $4, 
         ativo = true,
         updated_at = CURRENT_TIMESTAMP
         WHERE role = 'admin'
         RETURNING id, nome, email, role, ativo`,
        ['Master Admin', 'master@sistema.com', hashedPassword, 'admin']
      );
      
      return res.status(200).json({
        success: true,
        message: 'Usuário master atualizado com sucesso',
        data: result.rows[0],
        credentials: {
          email: 'master@sistema.com',
          password: 'master123'
        }
      });
    } else {
      // Criar novo usuário master
      const result = await pool.query(
        `INSERT INTO usuarios (nome, email, senha, role, ativo) 
         VALUES ($1, $2, $3, $4, true) 
         RETURNING id, nome, email, role, ativo`,
        ['Master Admin', 'master@sistema.com', hashedPassword, 'admin']
      );

      console.log('✅ Usuário master criado com sucesso');
      
      res.status(201).json({
        success: true,
        message: 'Usuário master criado com sucesso',
        data: result.rows[0],
        credentials: {
          email: 'master@sistema.com',
          password: 'master123'
        }
      });
    }
  } catch (error) {
    console.error('❌ Erro ao criar usuário master:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// GET /api/setup/check-users - Verificar usuários existentes
router.get('/check-users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome, email, role, ativo, created_at FROM usuarios ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      users: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
});

// POST /api/setup/reset-admin - Resetar senha do admin
router.post('/reset-admin', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const result = await pool.query(
      `UPDATE usuarios SET 
       senha = $1, 
       ativo = true,
       updated_at = CURRENT_TIMESTAMP
       WHERE email = 'admin@sistema.com' OR role = 'admin'
       RETURNING id, nome, email, role`,
      [hashedPassword]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuário admin não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Senha do admin resetada para: admin123',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Erro ao resetar senha:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
});

module.exports = router;