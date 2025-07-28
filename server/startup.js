#!/usr/bin/env node

// Enhanced startup script with detailed logging
console.log('🔥 STARTUP SCRIPT INICIADO');
console.log('🔥 Timestamp:', new Date().toISOString());
console.log('🔥 Node.js version:', process.version);
console.log('🔥 Platform:', process.platform);
console.log('🔥 Architecture:', process.arch);
console.log('🔥 Working directory:', process.cwd());
console.log('🔥 Script path:', __filename);

// Log all environment variables that start with DB_ or are JWT_SECRET
console.log('🔥 ENVIRONMENT VARIABLES:');
Object.keys(process.env)
  .filter(key => key.startsWith('DB_') || key === 'JWT_SECRET' || key === 'NODE_ENV' || key === 'PORT')
  .forEach(key => {
    if (key.includes('PASSWORD') || key.includes('SECRET')) {
      console.log(`   ${key}: ${process.env[key] ? '[SET]' : '[NOT SET]'}`);
    } else {
      console.log(`   ${key}: ${process.env[key]}`);
    }
  });

// Force environment check
console.log('🔥 REQUIRED ENVIRONMENT CHECK:');
const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];
console.log('🔥 Expected DB_PASSWORD should be: RF@DB##&441');
let missingVars = [];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
    console.log(`❌ MISSING: ${varName}`);
  } else {
    console.log(`✅ FOUND: ${varName}`);
  }
});

if (missingVars.length > 0) {
  console.log('🔥 MISSING ENVIRONMENT VARIABLES:', missingVars);
  console.log('🔥 This may cause connection issues!');
} else {
  console.log('🔥 All required environment variables are set');
}

// Start the main server
console.log('🔥 Starting main server...');
require('./index.js');