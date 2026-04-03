import fs from 'fs';
import pg from 'pg';

const { Pool } = pg;

async function runMigration() {
  console.log('🚀 Executando migrações PostgreSQL...');
  console.log('URL:', process.env.DATABASE_URL);
  
  try {
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 10000
    });
    
    const client = await pool.connect();
    console.log('✅ Conectado ao PostgreSQL');
    
    // Ler arquivo de migração
    const sql = fs.readFileSync('tabelas_corretas.sql', 'utf8');
    console.log('📄 Executando tabelas_corretas.sql...');
    
    // Executar migração
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log('✅ Migração executada com sucesso!');
    
    // Verificar tabelas criadas
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`📋 Tabelas criadas: ${result.rows.length}`);
    result.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.table_name}`);
    });
    
    client.release();
    await pool.end();
    
    return true;
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    return false;
  }
}

// Carregar .env
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...value] = line.split('=');
      if (key && value.length > 0) {
        process.env[key.trim()] = value.join('=').trim();
      }
    }
  });
}

runMigration().then(success => {
  if (success) {
    console.log('\n🎉 Migração concluída com sucesso!');
    process.exit(0);
  } else {
    console.log('\n❌ Migração falhou');
    process.exit(1);
  }
});