#!/bin/bash

echo "========================================="
echo "CONFIGURAÇÃO SQLITE - RETÍFICAPRO"
echo "========================================="
echo ""

# Configurar para usar SQLite
echo "1. CONFIGURANDO SQLITE..."
cat > /opt/techmotor/.env << 'EOF'
# Configuração SQLite
DATABASE_URL=file:./techmotor.db
NODE_ENV=development
PORT=5000
SESSION_SECRET=techmotor-secret-key-change-in-production
JWT_SECRET=jwt-secret-key-change-in-production
EOF

echo "✅ .env configurado para SQLite"
echo ""

# Instalar dependências SQLite
echo "2. INSTALANDO DEPENDÊNCIAS SQLITE..."
cd /opt/techmotor
npm install better-sqlite3 2>/dev/null || echo "⚠️  Possível erro na instalação"

# Modificar db.ts para usar SQLite
echo "3. CONFIGURANDO DB.TS PARA SQLITE..."
cat > /opt/techmotor/server/db.ts << 'EOF'
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../shared/schema";

// Configuração para SQLite
const sqlite = new Database("./techmotor.db");
const db = drizzle(sqlite, { schema });

console.log('✅ Conectado ao SQLite: techmotor.db');

export { db };
EOF

echo "✅ db.ts configurado para SQLite"
echo ""

# Criar banco SQLite e executar migrações
echo "4. CRIANDO BANCO E EXECUTANDO MIGRAÇÕES..."
cd /opt/techmotor

# Primeiro, converter migrações SQL para SQLite
echo "   Convertendo migrações para SQLite..."

# Criar arquivo de migração SQLite
cat > migrate-sqlite.sql << 'EOF'
-- Tabela de tenants (retíficas)
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  subscription_plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'trial',
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de subscriptions (assinaturas)
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  plano TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  valor REAL NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de users (usuários por tenant)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'technician',
  active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, email)
);

-- Tabelas do negócio
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp_opt_in BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  chassis TEXT NOT NULL,
  plate TEXT,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  engine_type TEXT,
  client_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  os_number TEXT NOT NULL,
  open_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  client_id INTEGER,
  vehicle_id INTEGER,
  status TEXT DEFAULT 'OPEN',
  budget_approved BOOLEAN DEFAULT false,
  UNIQUE(tenant_id, os_number)
);

-- Inserir dados de exemplo
INSERT OR IGNORE INTO tenants (id, name, email, password_hash, subscription_plan, status, phone) 
VALUES ('tenant-example-123', 'Retífica Exemplo', 'exemplo@retifica.com', '$2b$10$ExemploHashAqui1234567890ABCD', 'professional', 'active', '(11) 99999-9999');

INSERT OR IGNORE INTO subscriptions (tenant_id, plano, status, valor, data_inicio, data_fim)
SELECT 'tenant-example-123', 'professional', 'active', 197.00, date('now'), date('now', '+30 days')
WHERE NOT EXISTS (SELECT 1 FROM subscriptions WHERE tenant_id = 'tenant-example-123');

INSERT OR IGNORE INTO users (tenant_id, name, email, password_hash, role)
SELECT 'tenant-example-123', 'Administrador', 'exemplo@retifica.com', '$2b$10$ExemploHashAqui1234567890ABCD', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE tenant_id = 'tenant-example-123' AND email = 'exemplo@retifica.com');
EOF

# Executar migração
if command -v sqlite3 >/dev/null 2>&1; then
  sqlite3 techmotor.db < migrate-sqlite.sql
  echo "✅ Banco SQLite criado e migrações executadas"
  echo "   Tabelas criadas:"
  sqlite3 techmotor.db ".tables"
else
  echo "⚠️  sqlite3 não disponível, criando banco vazio"
  touch techmotor.db
fi

echo ""

# Atualizar schema para SQLite
echo "5. ATUALIZANDO SCHEMA PARA SQLITE..."
cat > /opt/techmotor/shared/schema.ts << 'EOF'
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Tabela para Tenants (Retíficas)
export const tenants = sqliteTable('tenants', {
  id: text('id').primaryKey().$defaultFn(() => 
    `tenant-${crypto.randomUUID()}`
  ),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  subscriptionPlan: text('subscription_plan').default('free'),
  status: text('status').default('trial'),
  phone: text('phone'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Tabela para Subscriptions (Assinaturas)
export const subscriptions = sqliteTable('subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: text('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  plano: text('plano').notNull(),
  status: text('status').default('active'),
  valor: real('valor').notNull(),
  dataInicio: integer('data_inicio', { mode: 'timestamp' }).notNull(),
  dataFim: integer('data_fim', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Tabelas do negócio (simplificadas para exemplo)
export const clients = sqliteTable('clients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: text('tenant_id').notNull(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  whatsappOptIn: integer('whatsapp_opt_in', { mode: 'boolean' }).default(false),
});

export const vehicles = sqliteTable('vehicles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: text('tenant_id').notNull(),
  chassis: text('chassis').notNull(),
  plate: text('plate'),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  year: integer('year'),
  engineType: text('engine_type'),
  clientId: integer('client_id'),
});

export const serviceOrders = sqliteTable('service_orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: text('tenant_id').notNull(),
  osNumber: text('os_number').notNull(),
  openDate: integer('open_date', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  clientId: integer('client_id'),
  vehicleId: integer('vehicle_id'),
  status: text('status').default('OPEN'),
  budgetApproved: integer('budget_approved', { mode: 'boolean' }).default(false),
});
EOF

echo "✅ Schema atualizado para SQLite"
echo ""

# Testar conexão
echo "6. TESTANDO CONEXÃO..."
cd /opt/techmotor
timeout 10 npm run dev 2>&1 | grep -E "(✅|Conectado|serving|error|Error)" || echo "Teste de conexão falhou"

echo ""
echo "========================================="
echo "CONFIGURAÇÃO CONCLUÍDA!"
echo "========================================="
echo ""
echo "✅ Sistema configurado com SQLite"
echo "✅ Banco: techmotor.db"
echo "✅ Schema atualizado"
echo "✅ .env configurado"
echo ""
echo "Para iniciar o servidor:"
echo "  cd /opt/techmotor"
echo "  npm run dev"
echo ""
echo "Para testar APIs:"
echo "  curl http://localhost:5000/api/health"
echo "  curl http://localhost:5000/api/landing/info"
echo ""
echo "Banco SQLite criado em: /opt/techmotor/techmotor.db"