import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import pg from 'pg';

const execAsync = promisify(exec);
const { Pool } = pg;

console.log('🔍 TESTANDO CONEXÃO COM POSTGRESQL...');
console.log('URL:', process.env.DATABASE_URL);

async function testConnection() {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    console.log('✅ Conexão PostgreSQL estabelecida com sucesso!');
    
    // Verificar se banco existe
    const dbResult = await client.query('SELECT current_database(), current_user');
    console.log(`📊 Banco: ${dbResult.rows[0].current_database}`);
    console.log(`👤 Usuário: ${dbResult.rows[0].current_user}`);
    
    // Listar tabelas existentes
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`📋 Tabelas existentes: ${tablesResult.rows.length}`);
    if (tablesResult.rows.length > 0) {
      console.log('   ' + tablesResult.rows.map(r => r.table_name).join(', '));
    }
    
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão PostgreSQL:', error.message);
    return false;
  }
}

async function runMigrations() {
  console.log('\n🚀 EXECUTANDO MIGRAÇÕES SQL...');
  
  const sqlFiles = [
    'create-tables.sql',
    'create-tenants-tables.sql',
    'tabelas_corretas.sql'
  ];
  
  for (const sqlFile of sqlFiles) {
    if (fs.existsSync(sqlFile)) {
      console.log(`\n📄 Executando: ${sqlFile}`);
      try {
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');
        
        // Conectar e executar
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const client = await pool.connect();
        
        // Executar em transação
        await client.query('BEGIN');
        await client.query(sqlContent);
        await client.query('COMMIT');
        
        console.log(`   ✅ ${sqlFile} executado com sucesso`);
        
        client.release();
        await pool.end();
      } catch (error) {
        console.error(`   ❌ Erro em ${sqlFile}:`, error.message);
        // Continuar com próximo arquivo
      }
    } else {
      console.log(`   ⚠️  Arquivo ${sqlFile} não encontrado`);
    }
  }
}

async function verifyTables() {
  console.log('\n🔍 VERIFICANDO TABELAS CRIADAS...');
  
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`✅ Total de tabelas: ${result.rows.length}`);
    result.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });
    
    // Verificar tabelas importantes
    const importantTables = ['tenants', 'subscriptions', 'users', 'clients', 'vehicles', 'service_orders'];
    const existingTables = result.rows.map(r => r.table_name);
    
    console.log('\n📊 STATUS DAS TABELAS IMPORTANTES:');
    importantTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ❌ ${table} (FALTANDO)`);
      }
    });
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('Erro ao verificar tabelas:', error.message);
  }
}

async function main() {
  console.log('=========================================');
  console.log('CONFIGURAÇÃO POSTGRESQL - RETÍFICAPRO');
  console.log('=========================================');
  
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
  
  // Testar conexão
  const connected = await testConnection();
  if (!connected) {
    console.log('\n❌ Não foi possível conectar ao PostgreSQL');
    console.log('Verifique se o container techmotor-postgres-1 está rodando:');
    console.log('  docker ps | grep techmotor-postgres');
    console.log('\nCredenciais do docker-compose.yml:');
    console.log('  Host: localhost:5432');
    console.log('  User: postgres');
    console.log('  Pass: postgres123');
    console.log('  DB: techmotor');
    return;
  }
  
  // Executar migrações
  await runMigrations();
  
  // Verificar tabelas
  await verifyTables();
  
  console.log('\n=========================================');
  console.log('CONFIGURAÇÃO CONCLUÍDA!');
  console.log('=========================================');
  console.log('\n✅ PostgreSQL configurado e migrações executadas');
  console.log('✅ Banco: techmotor');
  console.log('✅ Host: localhost:5432');
  console.log('\nPara iniciar o servidor:');
  console.log('  cd /opt/techmotor');
  console.log('  npm run dev');
  console.log('\nPara testar APIs:');
  console.log('  curl http://localhost:5000/api/health');
  console.log('  curl http://localhost:5000/api/landing/info');
}

main().catch(console.error);