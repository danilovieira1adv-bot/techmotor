import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { migrate } from 'drizzle-orm/sqlite-proxy/migrator';
import * as schema from '../shared/schema';

// Para desenvolvimento com SQLite
const db = drizzle(async (sql, params, method) => {
  try {
    console.log(`📦 [SQLite Mock] ${method}: ${sql}`);
    
    // Mock de respostas baseado nas queries
    if (sql.includes('SELECT') && sql.includes('tenants')) {
      return {
        rows: [
          {
            id: 'mock-tenant-id-123',
            name: 'Retífica Exemplo',
            email: 'exemplo@retifica.com',
            password_hash: '$2b$10$mockhash',
            subscription_plan: 'professional',
            status: 'active',
            phone: '(11) 99999-9999',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      };
    }
    
    if (sql.includes('SELECT') && sql.includes('subscriptions')) {
      return {
        rows: [
          {
            id: 1,
            tenant_id: 'mock-tenant-id-123',
            plano: 'professional',
            status: 'active',
            valor: '197.00',
            data_inicio: new Date().toISOString(),
            data_fim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
          }
        ]
      };
    }
    
    if (sql.includes('INSERT')) {
      return { rows: [{ id: 999 }], rowCount: 1 };
    }
    
    // Resposta padrão para outras queries
    return { rows: [], rowCount: 0 };
  } catch (error) {
    console.error('Erro no mock SQLite:', error);
    return { rows: [], rowCount: 0 };
  }
}, { schema });

export { db };