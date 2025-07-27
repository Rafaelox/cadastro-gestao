const { Pool } = require('pg');

// Validate required environment variables
if (!process.env.DB_PASSWORD) {
  console.error('ERRO: DB_PASSWORD não está definido nas variáveis de ambiente');
  process.exit(1);
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
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Database connection logging
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro na conexão PostgreSQL:', err);
});

// Test database connection with retry
async function testConnection(retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('✅ Conexão com banco de dados estabelecida com sucesso');
      return true;
    } catch (error) {
      console.error(`❌ Tentativa ${i + 1}/${retries} falhou:`, error.message);
      if (i < retries - 1) {
        console.log('🔄 Tentando novamente em 2 segundos...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
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