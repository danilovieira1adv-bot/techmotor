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
