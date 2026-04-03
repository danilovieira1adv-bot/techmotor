-- Tabela de tenants (retíficas)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  subscription_plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'trial',
  phone TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de subscriptions (assinaturas)
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  plano TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  valor DECIMAL(10,2) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de users (usuários por tenant)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'technician',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, email)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_data_fim ON subscriptions(data_fim);

-- Inserir tenant de exemplo
INSERT INTO tenants (name, email, password_hash, subscription_plan, status, phone) 
VALUES ('Retífica Exemplo', 'exemplo@retifica.com', '$2b$10$ExemploHashAqui1234567890ABCD', 'profissional', 'active', '(11) 99999-9999')
ON CONFLICT (email) DO NOTHING;

-- Inserir assinatura de exemplo
INSERT INTO subscriptions (tenant_id, plano, status, valor, data_inicio, data_fim)
SELECT id, 'profissional', 'active', 197.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'
FROM tenants WHERE email = 'exemplo@retifica.com'
ON CONFLICT DO NOTHING;

-- Inserir usuário admin de exemplo
INSERT INTO users (tenant_id, name, email, password_hash, role)
SELECT id, 'Administrador', 'exemplo@retifica.com', '$2b$10$ExemploHashAqui1234567890ABCD', 'admin'
FROM tenants WHERE email = 'exemplo@retifica.com'
ON CONFLICT (tenant_id, email) DO NOTHING;
