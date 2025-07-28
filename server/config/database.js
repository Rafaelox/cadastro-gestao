const { Pool } = require('pg');

// Validate required environment variables
if (!process.env.DB_PASSWORD) {
  console.error('⚠️ AVISO: DB_PASSWORD não está definido nas variáveis de ambiente');
  console.error('⚠️ A aplicação pode ter problemas de conectividade com o banco');
}

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'InfoDB',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: false
});

// Database connection logging
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro na conexão PostgreSQL:', err);
});

// Test database connection with non-blocking retry logic
async function testConnection(retries = 5) {
  console.log('🔌 Iniciando teste de conexão com banco de dados...');
  console.log(`🔌 Configuração do banco:`);
  console.log(`   - Host: ${process.env.DB_HOST}`);
  console.log(`   - Port: ${process.env.DB_PORT}`);
  console.log(`   - Database: ${process.env.DB_NAME}`);
  console.log(`   - User: ${process.env.DB_USER}`);
  console.log(`   - Password: ${process.env.DB_PASSWORD ? '[CONFIGURED]' : '[NOT CONFIGURED]'}`);
  
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔌 Tentativa ${i + 1}/${retries} de conexão...`);
      
      const start = Date.now();
      const result = await pool.query('SELECT 1 as test, NOW() as server_time, version() as pg_version');
      const duration = Date.now() - start;
      
      console.log(`✅ Conexão com banco de dados estabelecida com sucesso em ${duration}ms`);
      console.log(`✅ PostgreSQL Version: ${result.rows[0].pg_version}`);
      console.log(`✅ Server Time: ${result.rows[0].server_time}`);
      
      // Test a more complex query to ensure full functionality
      try {
        await pool.query('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = $1', ['public']);
        console.log('✅ Teste de consulta avançada bem-sucedido');
      } catch (err) {
        console.warn('⚠️ Aviso: Teste de consulta avançada falhou:', err.message);
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Tentativa ${i + 1}/${retries} falhou:`);
      console.error(`❌ Erro: ${error.message}`);
      console.error(`❌ Código: ${error.code}`);
      
      if (error.code === 'ECONNREFUSED') {
        console.error('❌ Conexão recusada - Verifique se o PostgreSQL está rodando');
        console.error(`❌ Tentando conectar em: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
      } else if (error.code === 'ENOTFOUND') {
        console.error('❌ Host não encontrado - Verifique DB_HOST');
        console.error(`❌ Hostname atual: ${process.env.DB_HOST}`);
        console.error('❌ Dica: Em Docker, verifique se o serviço do banco está com o nome correto');
      } else if (error.code === '28P01') {
        console.error('❌ Falha de autenticação - Verifique DB_USER e DB_PASSWORD');
      } else if (error.code === '3D000') {
        console.error('❌ Banco de dados não existe - Verifique DB_NAME');
        console.error(`❌ Database configurado: ${process.env.DB_NAME}`);
      }
      
      if (i < retries - 1) {
        const waitTime = Math.min(3000 * (i + 1), 8000); // Linear backoff, max 8s
        console.log(`🔄 Aguardando ${waitTime}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  console.log(`⚠️  Não foi possível conectar ao PostgreSQL após ${retries} tentativas`);
  console.error('❌ Problemas mais comuns:');
  console.error('   1. Container do PostgreSQL não está rodando');
  console.error('   2. Nome do serviço no Docker está incorreto (DB_HOST)');
  console.error('   3. Credenciais estão incorretas');
  console.error('   4. Banco de dados não foi criado');
  console.error('   5. Porta está bloqueada ou incorreta');
  return false;
}

// Graceful shutdown
async function closeConnection() {
  try {
    await pool.end();
    console.log('✅ Conexão com banco de dados encerrada');
  } catch (error) {
    console.error('❌ Erro ao encerrar conexão:', error);
  }
}

module.exports = { pool, testConnection, closeConnection };