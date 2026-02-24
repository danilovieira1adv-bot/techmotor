-- Tabela de clientes
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  whatsapp_opt_in BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de veículos
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  plate TEXT,
  model TEXT,
  brand TEXT,
  year INTEGER,
  engine_type TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de ordens de serviço
CREATE TABLE service_orders (
  id SERIAL PRIMARY KEY,
  number TEXT UNIQUE,
  client_id INTEGER REFERENCES clients(id),
  vehicle_id INTEGER REFERENCES vehicles(id),
  status TEXT DEFAULT 'pending',
  description TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de peças
CREATE TABLE parts (
  id SERIAL PRIMARY KEY,
  service_order_id INTEGER REFERENCES service_orders(id) ON DELETE CASCADE,
  type TEXT,
  serial_number TEXT,
  brand TEXT,
  model TEXT,
  qr_code TEXT,
  status TEXT DEFAULT 'pending_inspection',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de inspeções
CREATE TABLE inspections (
  id SERIAL PRIMARY KEY,
  part_id INTEGER REFERENCES parts(id) ON DELETE CASCADE,
  technician TEXT,
  measurements JSONB,
  photos JSONB,
  ai_report TEXT,
  approved BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de usinagem
CREATE TABLE machining (
  id SERIAL PRIMARY KEY,
  inspection_id INTEGER REFERENCES inspections(id) ON DELETE CASCADE,
  operations JSONB,
  final_measurements JSONB,
  approved BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de base de conhecimento (COM A COLUNA info_type)
CREATE TABLE knowledge_base (
  id SERIAL PRIMARY KEY,
  manufacturer TEXT,
  model TEXT,
  component TEXT,
  info_type TEXT,
  torque_data JSONB,
  clearance_data JSONB,
  video_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inserir dados de exemplo
INSERT INTO clients (name, phone) VALUES ('Cliente Teste', '11999999999');
INSERT INTO vehicles (client_id, plate, model, brand, year, engine_type) VALUES (1, 'ABC1234', 'FH 460', 'Volvo', 2022, 'D13K');
INSERT INTO knowledge_base (manufacturer, model, component, info_type, torque_data) VALUES ('Cummins', 'ISF 2.8', 'cabeçote', 'torque', '{"torque": "120 Nm", "steps": ["30 Nm", "60 Nm", "90 Nm", "120 Nm"]}');
INSERT INTO knowledge_base (manufacturer, model, component, info_type, clearance_data) VALUES ('Cummins', 'ISF 2.8', 'bronzina', 'clearance', '{"min": "0.05mm", "max": "0.08mm"}');