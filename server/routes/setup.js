const express = require('express');
const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

const router = express.Router();

// Função para garantir o usuário master - Implementa a lógica "Achou, Atualiza! Não Achou, Cria!"
async function ensureMasterAdmin() {
  const email = 'master@sistema.com';
  const nome = 'Master Admin';
  const role = 'admin';
  const hashedPassword = await bcrypt.hash('master123', 10);

  try {
    // 1. Procurar pelo Master Admin com esse email e role
    let existingUser = await pool.query(
      'SELECT id, nome, email FROM usuarios WHERE email = $1 AND role = $2', 
      [email, role]
    );

    if (existingUser.rows.length > 0) {
      // 🎉 Achamos! O Master Admin já existe! Agora, só vamos atualizá-lo.
      // Isso evita a duplicação porque estamos atualizando o registro JÁ EXISTENTE.
      const result = await pool.query(
        `UPDATE usuarios SET
           nome = $1,
           senha = $2,
           ativo = true,
           updated_at = CURRENT_TIMESTAMP
         WHERE email = $3 AND role = $4
         RETURNING id, nome, email, role, ativo`,
        [nome, hashedPassword, email, role] // Não mudamos o email, só a senha e o nome!
      );
      console.log('💚 Master Admin atualizado com sucesso:', result.rows[0]);
      return result.rows[0];
    } else {
      // ✨ Não achamos! É um ótimo dia para criar um Master Admin novinho!
      const result = await pool.query(
        `INSERT INTO usuarios (nome, email, senha, role, ativo, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, nome, email, role, ativo`,
        [nome, email, hashedPassword, role, true]
      );
      console.log('💖 Master Admin criado com sucesso:', result.rows[0]);
      return result.rows[0];
    }
  } catch (error) {
    console.error('💔 Erro ao garantir o Master Admin:', error.message);
    throw error;
  }
}

// POST /api/setup/create-master - Criar usuário master inicial
router.post('/create-master', async (req, res) => {
  try {
    console.log('🔧 Criando usuário master...');
    
    const adminUser = await ensureMasterAdmin();
    
    res.status(200).json({
      success: true,
      message: 'Usuário master configurado com sucesso',
      data: adminUser,
      credentials: {
        email: 'master@sistema.com',
        password: 'master123'
      }
    });
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